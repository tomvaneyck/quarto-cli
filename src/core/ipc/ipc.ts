import {
  AsyncCallable,
  Callable,
  IPCEndPoint,
  IPCMessage,
  ipcMessageTypes,
  LambdaCapture,
  lambdaUUID,
  SerializedLambdaCapture,
} from "./ipc-types.ts";

export function debug(s: string) {
  Deno.stderr.writeSync(new TextEncoder().encode(`${s}\n`));
}

function escapeValue(arg: unknown): {
  escapedOutput: unknown;
  captures: LambdaCapture[];
} {
  const escapeLambda = (
    x: Callable,
  ): LambdaCapture => {
    return {
      type: "lambda",
      "clash-avoidance-uuid": lambdaUUID,
      uuid: globalThis.crypto.randomUUID(),
      capture: x,
    };
  };

  const captures: LambdaCapture[] = [];
  const inner = (arg: unknown): unknown => {
    if (typeof arg === "function") {
      const capturedLambda = escapeLambda(arg as Callable);
      captures.push(capturedLambda);
      return capturedLambda;
    } else if (Array.isArray(arg)) {
      return arg.map(inner);
    } else if (typeof arg === "object") {
      const objArg = arg as { [key: string]: unknown };
      // this is an unfortunate clash, we fail here (you used our UUID, :shrug:)
      if (
        objArg.type === "lambda" &&
        objArg["clash-avoidance-uuid"] === lambdaUUID
      ) {
        throw new Error("Internal Error: please don't use our UUID.");
      }
      return Object.fromEntries(
        Object.entries(objArg).map(([key, value]) => [key, inner(value)]),
      );
    } else {
      return arg;
    }
  };

  return {
    captures,
    escapedOutput: inner(arg),
  };
}

function makeIPCEndPoint(
  ws: WebSocket,
  api: unknown,
  resolveReceivedGenesis?: Callable,
): IPCEndPoint {
  const ipcCaptures: Record<string, LambdaCapture> = {};
  const receivers: Record<string, {
    resolve: Callable;
    reject: Callable;
  }> = {};
  let receivedGenesis = false;

  const panic = (message: string) => {
    result.send({
      type: "error",
      message,
    });
    ws.close();
  };

  const captureValue = (value: unknown): unknown => {
    const escapedValue = escapeValue(value);
    for (const capture of escapedValue.captures) {
      ipcCaptures[capture.uuid] = capture;
    }
    return escapedValue.escapedOutput;
  };

  const unescapeLambda = (capture: SerializedLambdaCapture): AsyncCallable => {
    return (...args: unknown[]): Promise<unknown> => {
      const callUUID = globalThis.crypto.randomUUID();
      result.send({
        type: "call",
        sequence: callUUID,
        uuid: capture.uuid,
        args,
      });
      return new Promise((resolve, reject) => {
        receivers[callUUID] = { resolve, reject };
      });
    };
  };
  const unescapeValue = (arg: unknown): unknown => {
    const inner = (arg: unknown): unknown => {
      if (Array.isArray(arg)) {
        return arg.map(inner);
      } else if (typeof arg === "object") {
        const objArg = arg as { [key: string]: unknown };
        // this is an unfortunate clash, we fail here (you used our secret UUID, :shrug:)
        if (
          objArg.type === "lambda" &&
          objArg["clash-avoidance-uuid"] === lambdaUUID &&
          typeof objArg.uuid === "string"
        ) {
          return unescapeLambda(arg as SerializedLambdaCapture);
        } else {
          return Object.fromEntries(
            Object.entries(objArg).map(([key, value]) => [key, inner(value)]),
          );
        }
      } else {
        return arg;
      }
    };
    return inner(arg);
  };

  const captureMessage = (msg: IPCMessage): IPCMessage => {
    switch (msg.type) {
      case "call": {
        msg.args = msg.args.map(captureValue);
        break;
      }
      case "error": {
        break;
      }
      case "reject":
      case "resolve": {
        msg.result = captureValue(msg.result);
        break;
      }
      case "genesis": {
        msg.value = captureValue(msg.value);
        break;
      }
    }
    return msg;
  };

  ws.onmessage = async (m) => {
    const data = JSON.parse(m.data) as IPCMessage;
    console.log("---\nMessage.");
    console.log(JSON.stringify(data, null, 2));
    console.log("---");
    if (
      typeof data.type !== "string" ||
      ipcMessageTypes.indexOf(data.type) === -1
    ) {
      // notify server of malformed message and close
      console.error({ data });
      return panic("You sent me a malformed message. Closing.");
    }
    switch (data.type) {
      case "error": {
        return panic(`Other side reported error: ${data.message}. Closing.`);
      }
      case "genesis": {
        if (receivedGenesis) {
          return panic("Other side sent more than one genesis message");
        }
        receivedGenesis = true;
        result.api = unescapeValue(data.value);
        if (resolveReceivedGenesis) {
          resolveReceivedGenesis();
        }
        break;
      }
      case "resolve":
      case "reject": {
        if (receivers[data.sequence] === undefined) {
          return panic("Other side sent bad sequence number");
        }
        const rejectValue = unescapeValue(data.result);
        receivers[data.sequence][data.type](rejectValue);
        delete receivers[data.sequence];
        break;
      }
      case "call": {
        if (ipcCaptures[data.uuid] === undefined) {
          return panic("Other side sent bad sequence number");
        }

        const localArgs = data.args.map((arg) => unescapeValue(arg));
        try {
          const callResult = await ipcCaptures[data.uuid].capture(...localArgs);
          result.send({
            type: "resolve",
            result: callResult,
            sequence: data.sequence,
          });
        } catch (e) {
          result.send({
            type: "reject",
            result: {
              stack: e.stack,
              name: e.name,
              message: e.message,
            },
            sequence: data.sequence,
          });
        }
        break;
      }
    }
  };

  const result = {
    close() {
      ws.close();
      this.status = "closed";
    },
    send(msg: IPCMessage) {
      if (this.status !== "open") {
        throw new Error("Can't send on non-open connection");
      }
      msg = captureMessage(msg);
      ws.send(JSON.stringify(msg));
    },
    status: "closed",
    api,
  };
  return result;
}

const defaultPort = 59235;

export function serve(api: unknown, port?: number) {
  const openSockets: WebSocket[] = [];
  port = port ?? defaultPort;

  debug("Opening websocket");
  const s = Deno.listen({
    port,
  });
  let closed = false;

  let resolveDone: Callable;
  let resolveReady: Callable;
  const done = new Promise((resolve, _reject) => {
    resolveDone = resolve;
  });
  const ready = new Promise((resolve, _reject) => {
    resolveReady = resolve;
  });

  // https://deno.land/manual@v1.9.2/runtime/http_server_apis
  const serveLoop = async () => {
    resolveReady();
    for await (const conn of s) {
      if (closed) {
        return;
      }
      (async () => {
        const httpConn = Deno.serveHttp(conn);
        for await (const reqEvt of httpConn) {
          const req = reqEvt.request;
          if (req.headers.get("upgrade") !== "websocket") {
            await reqEvt.respondWith(new Response(null, { status: 501 }));
          }
          const { socket: ws, response } = Deno.upgradeWebSocket(req);
          debug("Upgraded websocket");

          const endPoint: IPCEndPoint = makeIPCEndPoint(ws, api);

          ws.onopen = () => {
            debug("server ws.onopen");
            endPoint.status = "open";
            endPoint.send({
              type: "genesis",
              value: api,
            });
          };

          ws.onclose = () => {
            endPoint.status = "closed";
          };
          ws.onerror = (e) => {
            console.error(e);
            endPoint.status = "closed";
            ws.close();
          };
          openSockets.push(ws);
          await reqEvt.respondWith(response);
        }
      })();
    }
  };
  serveLoop();

  return {
    done,
    ready,
    close: () => {
      closed = true;
      for (const ws of openSockets) {
        ws.close();
      }
      resolveDone();
    },
  };
}

export async function connect(
  address?: string,
  port?: number,
): Promise<IPCEndPoint> {
  address = address ?? "localhost";
  port = port ?? defaultPort;

  debug("before websocket");
  const ws = new WebSocket(`ws://${address}:${port}`);
  let resolveOpen: Callable;
  let resolveReceivedGenesis: Callable;
  debug("after websocket");

  const ready = Promise.all([
    new Promise((resolve, _) => resolveOpen = resolve),
    new Promise((resolve, _) => resolveReceivedGenesis = resolve),
  ]);
  ws.onopen = () => {
    debug("client ws open");
    result.status = "open";
    resolveOpen!();
  };

  const result: IPCEndPoint = makeIPCEndPoint(
    ws,
    undefined,
    resolveReceivedGenesis!,
  );

  await ready;

  return result;
}
