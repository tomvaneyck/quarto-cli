import { PandocNode, Walker, walker } from "./walk.ts";

export const filterAPI = {
  utils: {
    stringify: (v: PandocNode) => {
      const strs: string[] = [];
      walker({
        Str(v) {
          strs.push(v.c);
        },
        Space(_v: PandocNode) {
          strs.push(" ");
        },
      })(v);
      return strs.join("");
    },
  },
  run(filter: ((v: unknown) => unknown) | Walker) {
    if (typeof filter === "function") {
      this.emit(filter(this.doc()));
    } else {
      this.emit(walker(filter)(this.doc()));
    }
  },
  doc: () => JSON.parse(new TextDecoder().decode(Deno.readAllSync(Deno.stdin))),
  emit(doc: unknown) {
    Deno.stdout.writeSync(new TextEncoder().encode(JSON.stringify(doc)));
  },
  debug(msg: unknown) {
    const write = (str: string) =>
      Deno.stderr.writeSync(new TextEncoder().encode(str));
    // attempt to guess at pandoc node types

    if (typeof msg === "string") {
      write(msg);
      // deno-lint-ignore no-explicit-any
    } else if ((msg as any).t !== "undefined") {
      write(JSON.stringify(msg, null, 2));
    } else {
      write(String(msg));
    }
  },
};
