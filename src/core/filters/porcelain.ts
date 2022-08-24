import { Elt, EltMap, EltType } from "./pandoc-filter.ts";
import { Make } from "./_experiments.ts";
import { filterAPI } from "./api.ts";

export type Porcelain = {
  [P in keyof EltMapKeys]: Make<Pick<EltMapKeys, P>, Pick<EltMap, P>> & {
    t: P;
  };
};

//deno-lint-ignore no-explicit-any
export function fromPorcelain(v: any): any {
  const t = v.t;

  const convert = (keyMap: unknown) => {
    //deno-lint-ignore no-explicit-any
    const innerConvert = (innerKeyMap: any): any => {
      if (Array.isArray(innerKeyMap)) {
        return innerKeyMap.map(innerConvert);
      } else if (typeof innerKeyMap === "object") {
        return Object.fromEntries(
          Object.entries(innerKeyMap).map((
            [key, value],
          ) => [key, innerConvert(value)]),
        );
      } else {
        return v[innerKeyMap];
      }
    };
    return {
      t: v.t,
      c: innerConvert(keyMap),
    };
  };

  if (typeof t === "string") {
    const keyMap = EltMapKeys[t as keyof EltMapKeys];
    if (keyMap !== undefined) {
      const newV = convert(keyMap);

      if (newV.c !== undefined) {
        newV.c = fromPorcelain(newV.c);
      }

      return newV;
    }
  }
  if (Array.isArray(v)) {
    return v.map(fromPorcelain);
  }
  if (typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v).map(([key, value]) => [key, fromPorcelain(value)]),
    );
  }
  return v;
}

//deno-lint-ignore no-explicit-any
export function toPorcelain(v: any): any {
  const t = v.t;

  //deno-lint-ignore no-explicit-any
  const convert = (innerV: any, keyMap: unknown) => {
    //deno-lint-ignore no-explicit-any
    const result: any = {
      t: innerV.t,
    };
    //deno-lint-ignore no-explicit-any
    const innerConvert = (innerObj: any, innerKeyMap: unknown) => {
      if (Array.isArray(innerKeyMap)) {
        for (let i = 0; i < innerKeyMap.length; ++i) {
          innerConvert(innerObj[i], innerKeyMap[i]);
        }
      } else if (typeof innerKeyMap === "object") {
        for (const [key, value] of Object.entries(innerKeyMap!)) {
          innerConvert(innerObj[key], value);
        }
      } else {
        //deno-lint-ignore no-explicit-any
        result[innerKeyMap as any] = innerObj;
      }
    };
    innerConvert(innerV.c, keyMap);
    return result;
  };

  if (typeof t === "string") {
    const keyMap = EltMapKeys[t as keyof EltMapKeys];
    if (keyMap !== undefined) {
      let newV = {
        ...v,
      };
      if (newV.c !== undefined) {
        newV.c = toPorcelain(newV.c);
      }

      newV = convert(newV, keyMap);
      return newV;
    }
  }
  if (Array.isArray(v)) {
    return v.map(toPorcelain);
  }
  if (typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v).map(([key, value]) => [key, toPorcelain(value)]),
    );
  }
  return v;
}

// i'd love to not have to repeat this..
const AttrMap = ["id", "classes", "attributes"];
type AttrMap = ["id", "classes", "attributes"];
const TargetMap = ["target", "title"];
type TargetMap = ["target", "title"];

export type EltMapKeys = {
  Str: "v";
  Emph: "content";
  Strong: "content";
  Strikeout: "content";
  Superscript: "content";
  Subscript: "content";
  SmallCaps: "content";
  Quoted: ["quotetype", "content"];
  Cite: ["content", "citations"];
  Code: [AttrMap, "text"];
  Space: undefined;
  SoftBreak: undefined;
  LineBreak: undefined;
  Math: [{ t: "mathtype" }, "text"];
  RawInline: ["format", "text"];
  Link: [AttrMap, "content", TargetMap];
  Image: [AttrMap, "content", TargetMap];
  Note: "content";
  Span: [AttrMap, "content"];

  Plain: "content";
  Para: "content";
  LineBlock: "content";
  CodeBlock: [AttrMap, "content"];
  RawBlock: ["format", "text"];
  BlockQuote: "content";
  OrderedList: ["listAttributes", "items"];
  BulletList: ["content"];
  DefinitionList: ["content"];
  Header: ["level", AttrMap, "content"];
  HorizontalRule: undefined;

  // FIXME
  // Table: table seems wrong wrt to https://pandoc.org/lua-filters.html#type-table
  Div: [AttrMap, "content"];
  Null: undefined;
};

export const EltMapKeys = {
  Str: "v",
  Emph: "content",
  Strong: "content",
  Strikeout: "content",
  Superscript: "content",
  Subscript: "content",
  SmallCaps: "content",
  Quoted: ["quotetype", "content"],
  Cite: ["content", "citations"],
  Code: [AttrMap, "text"],
  Space: undefined,
  SoftBreak: undefined,
  LineBreak: undefined,
  Math: [{ t: "mathtype" }, "text"],
  RawInline: ["format", "text"],
  Link: [AttrMap, "content", TargetMap],
  Image: [AttrMap, "content", TargetMap],
  Note: "content",
  Span: [AttrMap, "content"],

  Plain: "content",
  Para: "content",
  LineBlock: "content",
  CodeBlock: [AttrMap, "content"],
  RawBlock: ["format", "text"],
  BlockQuote: "content",
  OrderedList: ["listAttributes", "items"],
  BulletList: ["content"],
  DefinitionList: ["content"],
  Header: ["level", AttrMap, "content"],
  HorizontalRule: undefined,

  Div: [AttrMap, "content"],
  Null: undefined,
};

/*
export type EltMap = {
  // Inline
  Str: string;
  Emph: Array<Inline>;
  Strong: Array<Inline>;
  Strikeout: Array<Inline>;
  Superscript: Array<Inline>;
  Subscript: Array<Inline>;
  SmallCaps: Array<Inline>;
  Quoted: [QuoteType, Array<Inline>];
  Cite: [Array<Citation>, Array<Inline>];
  Code: [Attr, string];
  Space: undefined;
  SoftBreak: undefined;
  LineBreak: undefined;
  Math: [MathType, string];
  RawInline: [Format, string];
  Link: [Attr, Array<Inline>, Target];
  Image: [Attr, Array<Inline>, Target];
  Note: Array<Block>;
  Span: [Attr, Array<Inline>];

  // Block
  Plain: Array<Inline>;
  Para: Array<Inline>;
  LineBlock: Array<Array<Inline>>;
  CodeBlock: [Attr, string];
  RawBlock: [Format, string];
  BlockQuote: Array<Block>;
  OrderedList: [ListAttributes, Array<Array<Block>>];
  BulletList: Array<Array<Block>>;
  DefinitionList: Array<[Array<Inline>, Array<Array<Block>>]>;
  Header: [number, Attr, Array<Inline>];
  HorizontalRule: undefined;
  Table: [
    Array<Inline>,
    Array<Alignment>,
    Array<number>,
    Array<TableCell>,
    Array<Array<TableCell>>,
  ];
  Div: [Attr, Array<Block>];
  Null: undefined;
};
*/

// function toPorcelain<A>(Elt<A extends EltType>): FancyElt<
