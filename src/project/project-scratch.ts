/*
* project-scratch.ts
*
* Copyright (C) 2020 by RStudio, PBC
*
*/

import { dirname, join } from "path/mod.ts";
import { safeEnsureDirSync } from "../core/path.ts";

export const kQuartoScratch = ".quarto";

export function projectScratchPath(dir: string, path = "") {
  const scratchDir = join(dir, kQuartoScratch);
  safeEnsureDirSync(scratchDir);
  if (path) {
    path = join(scratchDir, path);
    safeEnsureDirSync(dirname(path));
    return path;
  } else {
    return Deno.realPathSync(scratchDir);
  }
}
