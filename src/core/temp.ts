/*
* temp.ts
*
* Copyright (C) 2020 by RStudio, PBC
*
*/

import { debug, warning } from "log/mod.ts";
import { join } from "path/mod.ts";
import { ensureDirSync } from "fs/mod.ts";
import { removeIfExists } from "./path.ts";

let tempDir: string | undefined;

export function initSessionTempDir() {
  tempDir = Deno.makeTempDirSync({ prefix: "quarto-session" });
}

export function cleanupSessionTempDir() {
  if (tempDir) {
    removeIfExists(tempDir);
    tempDir = undefined;
  }
}

export interface TempContext {
  createFile: (tag: string, options?: Deno.MakeTempOptions) => string;
  createDir: (tag: string, options?: Deno.MakeTempOptions) => string;
  cleanup: () => void;
}

export function createTempContext(options?: Deno.MakeTempOptions) {
  let dir: string | undefined = Deno.makeTempDirSync({
    ...options,
    dir: tempDir,
  });
  return {
    createFile: (tag: string, options?: Deno.MakeTempOptions) => {
      debug(`Create Temp File: ${tag}`);
      return Deno.makeTempFileSync({ ...options, dir });
    },
    createDir: (tag: string, options?: Deno.MakeTempOptions) => {
      debug(`Create Temp Dir: ${tag}`);
      return Deno.makeTempDirSync({ ...options, dir });
    },
    cleanup: () => {
      debug("Clean Up Temp Files");
      if (dir) {
        try {
          removeIfExists(dir);
        } catch (error) {
          warning(`Error removing temp dir at ${dir}: ${error.message}`);
        }
        dir = undefined;
      }
    },
  };
}

export function systemTempDir(name: string) {
  const dir = join(rootTempDir(), name);
  ensureDirSync(dir);
  return dir;
}

function rootTempDir() {
  const tempDir = Deno.build.os === "windows"
    ? Deno.env.get("TMP") || Deno.env.get("TEMP") ||
      Deno.env.get("USERPROFILE") || ""
    : Deno.env.get("TMPDIR") || "/tmp";
  return Deno.realPathSync(tempDir);
}
