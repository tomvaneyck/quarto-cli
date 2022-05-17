/*
* ts-filters.ts
*
* Copyright (C) 2022 by RStudio, PBC
*
*/

import {
  asMappedString,
  mappedConcat,
  mappedLines,
} from "../lib/mapped-text.ts";
import { MappedString } from "../mapped-text.ts";
import { join } from "path/mod.ts";
import { withCriClient } from "../cri/cri.ts";
import { LanguageCellHandlerOptions } from "../handlers/types.ts";
import { makeHandlerContext } from "../handlers/base.ts";
import { isJavascriptCompatible } from "../../config/format.ts";

async function handleAltairCharts(
  options: LanguageCellHandlerOptions,
): Promise<MappedString> {
  const { markdown, temp } = options;

  if (isJavascriptCompatible(options.format)) {
    return markdown;
  }

  const { context } = makeHandlerContext(options);

  const lines = mappedLines(markdown, true);
  const output: MappedString[] = [];
  let altairChart: MappedString[] = [];

  const renderChart = async () => {
    const { baseName, fullName } = context.uniqueFigureName(
      "altair-viz-",
      "png",
    );

    const webpageDir = temp.createDir();
    const src = `<html><body>\n${
      mappedConcat(altairChart).value
    }</body></html>`;
    const indexPage = join(webpageDir, "index.html");
    Deno.writeTextFileSync(indexPage, src);

    const { width, height } = await withCriClient(async (client) => {
      await client.open(`file://${indexPage}`);
      const { DOM } = client.rawClient();
      const result = (await client.screenshots("body > div"))[0].data;
      const root = (await DOM.getDocument()).root.nodeId;
      const nodeId = (await DOM.querySelector(root, "body > div")).nodeId;
      const style =
        (await DOM.getAttributes(nodeId)).attributes.indexOf("style") + 1;
      const m0 = style.match(/.*width:\s*(\d+)\s*px/);
      const m1 = style.match(/.*height:\s*(\d+)\s*px/);
      let width, height;
      if (m0) width = Number(m0[1]) / 96;
      if (m1) height = Number(m1[1]) / 96;

      Deno.writeFileSync(fullName, result);
      return { width, height };
    });
    output.push(
      asMappedString(
        `![](${baseName}){width="${width}in" height="${height}in"}\n`,
      ),
    );
  };

  let state = "start";
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    switch (state) {
      case "start": {
        // ::: {.cell-output .cell-output-display execution_count=2}
        if (line.value.startsWith("::: {.cell-output .cell-output-display")) {
          state = "in-cell-output-display";
          continue;
        }
        output.push(line);
        break;
      }
      case "in-cell-output-display": {
        if (line.value.startsWith("```{=html}")) {
          state = "in-raw-html";
        } else if (line.value.startsWith(":::")) {
          state = "start";
        }
        output.push(line);
        break;
      }
      case "in-raw-html": {
        // <div id="altair-viz-4c1eebf761944a58a5f4e032cafdaea5"></div>
        if (line.value.startsWith('<div id="altair-viz-"')) {
          state = "in-altair-chart";
          altairChart = [line];
        } else {
          output.push(line);
        }
        break;
      }
      case "in-altair-chart": {
        altairChart.push(line);
        if (line.value.startsWith("</script>")) {
          await renderChart();
          state = "start";
        }
      }
    }
  }

  return mappedConcat(output);
}

export async function handleTSFilters(
  options: LanguageCellHandlerOptions,
): Promise<MappedString> {
  return await handleAltairCharts(options);
}
