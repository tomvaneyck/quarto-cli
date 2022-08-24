import { filterAPI as quarto } from "../../../core/filters/api.ts";
import { walker } from "../../../core/filters/walk.ts";
import { fromPorcelain, toPorcelain } from "../../../core/filters/porcelain.ts";

quarto.debug(quarto.pandocGlobals());

const doc = quarto.doc();

quarto.emit(fromPorcelain(toPorcelain(doc)));
