let _globals: unknown = undefined;

interface PandocGlobals {
  FORMAT: string;
  PANDOC_WRITER_OPTIONS: {
    extensions: string[];
  };
}

export function globals() {
  if (_globals === undefined) {
    // FIXME we need a better place for this file/filename.
    _globals = JSON.parse(Deno.readTextFileSync("/tmp/lua-globals.json"));
  }
  return _globals as PandocGlobals;
}
