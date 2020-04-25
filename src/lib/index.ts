import { ParseArguments } from "..";

export type ParserFn = (args: ParseArguments, ...params: any[]) => any;

export * from "./args";
export * from "./discord";
export * from "./functional";
export * from "./strings";
export * from "./time";
