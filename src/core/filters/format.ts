import { Elt, EltType } from "./pandoc-filter.ts";
import { globals } from "./globals.ts";

export function isRaw<T extends EltType>(el: Elt<T>) {
  return el.t === "RawBlock" || el.t === "RawInline";
}

export function isRawHtml<T extends EltType>(el: Elt<T>) {
  return isRaw(el) && el.t.startsWith("html");
}

export function isRawLatex<T extends EltType>(el: Elt<T>) {
  return isRaw(el) && (el.c[0] === "tex" || el.c[0] === "latex");
}

export function isLatexOutput() {
  const {
    FORMAT,
  } = globals();

  return FORMAT === "latex" || FORMAT === "beamer" || FORMAT === "pdf";
}

export function isBeamerOutput() {
  return globals().FORMAT === "beamer";
}

export function isDocxOutput() {
  return globals().FORMAT === "docx";
}

export function isRtfOutput() {
  return globals().FORMAT === "rtf";
}

export function isOdtOutput() {
  const FORMAT = globals().FORMAT;
  return FORMAT === "odt" || FORMAT === "opendocument";
}

export function isWordProcessorOutput() {
  const FORMAT = globals().FORMAT;
  return FORMAT === "docx" || FORMAT === "rtf" || isOdtOutput();
}

export function isPowerPointOutput() {
  const FORMAT = globals().FORMAT;
  return FORMAT === "pptx";
}

export function isRevealJsOutput() {
  const FORMAT = globals().FORMAT;
  return FORMAT === "revealjs";
}

export function isSlideOutput() {
  return isHtmlSlideOutput() || isBeamerOutput() || isPowerPointOutput();
}

export function isEpubOutput() {
  const FORMAT = globals().FORMAT;
  return ["epub", "epub2", "epub3"].indexOf(FORMAT) !== -1;
}

export function isMarkdownOutput() {
  const FORMAT = globals().FORMAT;
  const formats = [
    "markdown",
    "markdown_github",
    "markdown_mmd",
    "markdown_phpextra",
    "markdown_strict",
    "gfm",
    "commonmark",
    "commonmark_x",
    "markua",
  ];
  return formats.indexOf(FORMAT) !== -1;
}

export function isMarkdownWithHtmlOutput() {
  return isMarkdownOutput() &&
    globals().PANDOC_WRITER_OPTIONS.extensions.indexOf(
        "raw_html",
      ) !== -1;
}

export function isIpynbOutput() {
  const FORMAT = globals().FORMAT;
  return FORMAT === "ipynb";
}

export function isHtmlSlideOutput() {
  const FORMAT = globals().FORMAT;
  const formats = [
    "s5",
    "dzslides",
    "slidy",
    "slideous",
    "revealjs",
  ];
  return formats.indexOf(FORMAT) !== -1;
}

export function isHtmlOutput() {
  const FORMAT = globals().FORMAT;
  const formats = [
    "html",
    "html4",
    "html5",
    "epub",
    "epub2",
    "epub3",
  ];
  return formats.indexOf(FORMAT) !== -1;
}

export function isFormat(to: string) {
  const FORMAT = globals().FORMAT;
  if (FORMAT == to) {
    return true;
  } else {
    // latex and pdf are synonyms
    if (to == "latex" || to == "pdf") {
      return isLatexOutput();
      // odt and opendocument are synonyms
    } else if (to == "odt" || to == "opendocument") {
      return isOdtOutput();
      // epub: epub, epub2, || epub3
    } else if (to.match("epub")) {
      return isEpubOutput();
      // html: html, html4, html4, epub*, or slides (e.g. revealjs)
    } else if (to == "html") {
      return isHtmlOutput();
    } else if (to == "html:js") {
      // html formats that support javascript (excluding epub)
      return isHtmlOutput() && !isEpubOutput();
      // markdown: markdown*, commonmark*, gfm, markua
    } else if (to == "markdown") {
      return isMarkdownOutput();
    } else {
      return false;
    }
  }
}

const _export = {
  isRawHtml,
  isRawLatex,
  isFormat,
  isLatexOutput,
  isBeamerOutput,
  isDocxOutput,
  isRtfOutput,
  isOdtOutput,
  isWordProcessorOutput,
  isPowerPointOutput,
  isRevealJsOutput,
  isSlideOutput,
  isEpubOutput,
  isMarkdownOutput,
  isMarkdownWithHtmlOutput,
  isIpynbOutput,
  isHtmlOutput,
  isHtmlSlideOutput,
};

export default _export;
