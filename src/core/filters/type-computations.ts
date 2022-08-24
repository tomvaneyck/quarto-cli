//////////////////////////////////////////////////////////////////////////////////////////
// now for the typescript magic
//
// may they have mercy on our souls
//
// https://stackoverflow.com/a/68568535/221007
// https://stackoverflow.com/a/70317058/221007
// https://stackoverflow.com/a/50375286/221007

// this type function lets us derived typed "porcelain" types for the
// Pandoc JSON AST so that it feels much closer to the Lua version
// while still being typed.
//
// It's pretty hairy, but the dev experience on the other hand is great.

export type Make<Keys, Values> = [Keys, Values] extends [any[], any[]]
  ? Make<ObjFromTuple<Keys>, ObjFromTuple<Values>>
  : 
    & MakeClean<Keys, Values>
    & AllValues<MakeCompound<Keys, Values>>;

type MakeFromObj<Keys, Values> = Keys extends { [key: string | number]: string }
  ? Values extends { [key: string | number]: infer _V } ? {
    [P in (keyof Keys & keyof Values) as Keys[P]]: Values[P];
  }
  : never
  : never;

type CompoundKey<Key, Value> = Value extends string ? never : Key;

type CompoundKeys<T> = T extends { [key: string | number]: infer U }
  ? keyof { [P in keyof T as CompoundKey<P, T[P]>]: T[P] }
  : never;

type MakeClean<Keys, Values> = MakeFromObj<
  Omit<Keys, CompoundKeys<Keys>>,
  Omit<Values, CompoundKeys<Keys>>
>;

type MakeCompound<Keys, Values> = Keys extends
  { [key: string | number]: infer _U }
  ? Values extends { [key: string | number]: infer _T } ? {
    [
      P in (
        & keyof Pick<Keys, CompoundKeys<Keys>>
        & keyof Pick<Values, CompoundKeys<Keys>>
      ) as P
    ]: Make<Keys[P], Values[P]>;
  }
  : never
  : never;

type AllValues<T> = T extends { [key: string | number]: infer U }
  ? UnionToIntersection<U>
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

type ObjFromTuple<T> = T extends any[] ? T["length"] extends NumberUpTo<10> ? {
  [P in NumberUpTo<T["length"]> as `${P}`]: ObjFromTuple<T[P]>;
}
: T
  : T;

type IsNegative<N extends number> = `${N}` extends `-${number}` ? true : false;

//type NumberUpTo<T> = T extends number ? (T extends IsNegative<T> ? 0
//  : (Subtract<T, 1> | NumberUpTo<Subtract<T, 1>>))
//  : never;

type NumberUpTo<T> = T extends number
  ? (T extends IsNegative<T> ? 0 : NumbersTo<0, T>)
  : never;
type NumbersTo<V, Max extends number> = V extends number ? V extends Max ? never
: V | NumbersTo<Add<V, 1>, Max>
  : never;

type Length<T extends any[]> = T extends { length: infer L } ? L : never;

type BuildTuple<L extends number, T extends any[] = []> = T extends
  { length: L } ? T : BuildTuple<L, [...T, any]>;

type Subtract<A extends number, B extends number> = BuildTuple<A> extends
  [...(infer U), ...BuildTuple<B>] ? Length<U>
  : never;

type Add<A extends number, B extends number> = Length<
  [...BuildTuple<A>, ...BuildTuple<B>]
>;

////////////////////////////////////////////////////////////////////////////////////////////////////

type EltMapKeys = {
  Str: "content";
  Test: ["field1", ["field2", "field3"], "field4"];
  Simple: ["field5", "field6"];
  Nasty: { k: "field8" };
  bug: ["id", "classes", "attributes"];
};

type EltMap = {
  Str: string;
  Test: [string, [number, boolean], boolean];
  Simple: [number, boolean];
  Nasty: { k: string };
  bug: [string, Array<string>, Array<[string, string]>];
};

type Test = Make<EltMapKeys, EltMap>;
