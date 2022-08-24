import { filterAPI as quarto } from "../../../core/filters/api.ts";
import { walker, WalkerPorcelain } from "../../../core/filters/walk.ts";
import { fromPorcelain, toPorcelain } from "../../../core/filters/porcelain.ts";

quarto.debug(quarto.pandocGlobals());

const doc = toPorcelain(quarto.doc());

// quarto.debug(doc);

walker<WalkerPorcelain>({
  CodeBlock(v) {
    quarto.debug(v);
  },
})(doc);

quarto.emit(fromPorcelain(doc));
