import { pathFn as R } from "../util"
import { ParserFn } from "."

const exists = (args: Record<string, any>) => R(['tagArgs'], args)
export const argParsers: Record<string, ParserFn> = {
  args: args => exists(args) && args.tagArgs.length > 0 ? args.tagArgs.join(', ') : 'undefined',
  argslen: args => exists(args) ? args.tagArgs.length : 'undefined',
  arg: (args, index) => exists(args) && args.tagArgs[index] ? args.tagArgs[index] : 'undefined'
}
