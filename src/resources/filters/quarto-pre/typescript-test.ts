import { debug } from "../../../core/ipc/ipc.ts";

debug("before connect");
debug("after connect");

const v = new TextDecoder().decode(await Deno.readAll(Deno.stdin));

Deno.writeTextFileSync(
  "/tmp/deno-filter-out.json",
  v,
);

Deno.writeTextFileSync(
  "/dev/stderr",
  `\n${v}\n`,
);

Deno.stdout.writeSync(new TextEncoder().encode(v));

debug("done");
