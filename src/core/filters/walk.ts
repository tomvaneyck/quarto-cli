// A wee typescript pandoc filter library

import { Elt, EltType } from "./pandoc-filter.ts";
import { EltPorcelain } from "./porcelain.ts";

export type WalkerPlain = {
  [K in EltType as `${K}`]?: (v: Elt<K>) => unknown;
};

export type WalkerPorcelain = {
  [K in EltType as `${K}`]?: (v: EltPorcelain<K>) => unknown;
};

export type PandocNode = { [key: string]: unknown };

// pandoc-style walk semantics
export const walkObj = (obj: unknown, visit: (v: unknown) => unknown) => {
  if (Array.isArray(obj)) {
    const result: unknown[] = [];
    for (const value of obj) {
      const returnValue = visit(value);
      if (returnValue === null) {
        continue;
      }
      if (returnValue !== undefined) {
        if (Array.isArray(returnValue)) {
          result.push(...returnValue);
        } else {
          result.push(returnValue);
        }
      } else {
        result.push(walkObj(value, visit));
      }
    }
    return result;
  } else if (typeof obj === "object") {
    const result: PandocNode = {};
    for (
      const [key, value] of Object.entries(obj as { [key: string]: unknown })
    ) {
      const returnValue = visit(value);
      if (returnValue === null) {
        continue;
      }
      if (returnValue !== undefined) {
        result[key] = returnValue;
      } else {
        result[key] = walkObj(value, visit);
      }
    }
    return result;
  } else {
    const returnValue = visit(obj);
    if (returnValue !== undefined) {
      return returnValue;
    } else {
      return obj;
    }
  }
};

export function handleNode(type: string, nodeFun: (v: PandocNode) => unknown) {
  return (value: unknown) => {
    if (typeof value !== "object") {
      return undefined;
    }
    const obj = value as PandocNode;
    if (obj.t !== type) {
      return undefined;
    }
    return nodeFun(obj);
  };
}

export function pandocText(str: string) {
  const result = [];
  for (const v of str.split(/\s/)) {
    if (v.length) {
      result.push({ t: "Str", c: v });
    }
    result.push({ t: "Space" });
  }
  return result;
}

export function processNode(
  nodeType: string,
  nodeHandler: (v: PandocNode) => unknown,
) {
  return (input: unknown) => walkObj(input, handleNode(nodeType, nodeHandler));
}

// acorn-style walker.
export function walker<Type extends WalkerPlain | WalkerPorcelain>(
  obj: Type,
) {
  const handle = (input: unknown) => {
    // deno-lint-ignore no-explicit-any
    const t = ((input || "") as any).t as unknown;
    const v = obj[t as EltType];
    if (v !== undefined) {
      // deno-lint-ignore no-explicit-any
      return v(input as any);
    }
  };

  return (input: unknown) => walkObj(input, handle);
}
