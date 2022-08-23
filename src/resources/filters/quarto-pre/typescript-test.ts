import { filterAPI as quarto } from "../../../core/filters/api.ts";

quarto.run({
  Str(v) {
    v.c = v.c.toLocaleUpperCase();
  },
});
