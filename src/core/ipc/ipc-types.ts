export type Callable = (...args: unknown[]) => unknown;
export type AsyncCallable = (...args: unknown[]) => Promise<unknown>;

export type lambdaUUID = "37322cb3-d62f-4ab1-bc3c-47c148e2c8f3";
export const lambdaUUID = "37322cb3-d62f-4ab1-bc3c-47c148e2c8f3";

export const ipcMessageTypes = [
  "call",
  "resolve",
  "reject",
  "genesis",
  "error",
];

export type IPCCall = {
  type: "call";
  sequence: string; // sequence number to match call and resolve/reject
  uuid: string; // uuid of the call on the other side of the wire,
  args: unknown[]; // call arguments
};

export type IPCResolve = {
  type: "resolve";
  sequence: string; // sequence number that matches that of the call
  result: unknown; // result to be sent
};

export type IPCReject = {
  type: "reject";
  sequence: string; // sequence number that matches that of the call
  result: unknown; // error object to be sent
};

export type IPCGenesis = {
  type: "genesis";
  value: unknown; // genesis object for IPC that server sends to client which determines API
};

export type IPCError = {
  type: "error";
  message: string; // error message
};

export type IPCMessage =
  | IPCCall
  | IPCResolve
  | IPCReject
  | IPCGenesis
  | IPCError;

export interface SerializedLambdaCapture {
  "type": "lambda";
  "uuid": string;
  "clash-avoidance-uuid": lambdaUUID;
}

export interface LambdaCapture extends SerializedLambdaCapture {
  capture: Callable;
}

export interface IPCEndPoint {
  close: () => void;
  send: (data: IPCMessage) => void;
  status: string;

  api: unknown;
}

////////////////////////////////////////////////////////////////////////////////

/*
type T1 = Lift<number>;
type T2 = FunctionT<[a: string], string>;

type T5 = IsObj<ObjT>; // true
type T6 = IsObj<FunT>; // true
type T7 = IsFun<ObjT>; // false
type T8 = IsFun<FunT>; // true

type IsObj<T> = T extends { [K in keyof T]: infer V } ? true : false;
type IsFun<T> = T extends (...args: infer _U) => infer _V ? true : false;

// The ordering of Lift checks is weird because of T6: functions are objects even at the type level.
// But objects are not functions, so we can use that to catch them first
*/

type ForcePromise<T> = T extends Promise<infer U> ? Promise<U> : Promise<T>;

type AsAsync<T> = T extends (...args: infer U) => infer V
  ? (...args: U) => ForcePromise<V>
  : T;

type Lift<T> = T extends (...args: infer _U) => infer _V ? AsAsync<T>
  : (T extends { [K in keyof T]: infer V } ? { [P in keyof T]: Lift<T[P]> }
    : AsAsync<T>);

// APIType is used to compute the type of a client API from the type provided by the server
export type APIType<T> = Lift<T>;
