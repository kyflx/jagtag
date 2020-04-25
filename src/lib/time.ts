import { ParserFn } from "."

const moment = require('moment')

export const timeParsers: Record<string, ParserFn> = {
  now: (_args, format) => !format ? new Date().toUTCString() : moment().utc().format(format),
  time: (_args, ms, format) => !format ? new Date(+ms).toUTCString() : moment(+ms).utc().format(format)
}
