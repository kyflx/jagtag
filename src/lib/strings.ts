import { ParserFn } from ".";

export const stringParsers: Record<string, ParserFn> = {
  lower: (_args, str) => str.toLowerCase(),
  upper: (_args, str) => str.toUpperCase(),
  length: (_args, str) => str.length,
  url: (_args, str) => encodeURI(str),
  replace: (_args, toReplace, replaceWith, str) => str.replace(toReplace, replaceWith), // Regex supported
  substring: (_args, start, end, str) => str.substring(start, end),
  oneline: (_args, str) => str.replace(/\s+/g, ' '), // Also replaces newlines
  hash: (_args, str) => str.hashCode(str)
}
