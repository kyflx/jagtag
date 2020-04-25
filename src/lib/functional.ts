import { Parser } from "expr-eval";

import { ParserFn } from ".";
import { safeCompare } from "../util";

const mathEval = new Parser();
export const functionalParsers: Record<string, ParserFn> = {
  note: () => "",
  choose: function () {
    // Using legacy function for access to Function.arguments
    // The function has no defined arguments because Function.arguments is accessed instead (Option amount will vary)
    let choices = [...arguments];
    choices = choices.slice(1); // Remove args that might be passed from the parser
    return choices[Math.floor(Math.random() * choices.length)];
  },
  range: (_args, start, end) => {
    start = Math.ceil(start);
    end = Math.floor(end);
    return Math.floor(Math.random() * (end - start) + start);
  },
  if: (_args, item1, conditional, item2, truthyCond, falsyCond) => {
    if (safeCompare(item1, conditional, item2)) return truthyCond;
    else return falsyCond;
  },
  math: (_args, expr) => mathEval.parse(expr).evaluate(),
  abs: (_args, num) => Math.abs(num),
  floor: (_args, num) => Math.floor(num),
  ceil: (_args, num) => Math.ceil(num),
  round: (_args, num) => Math.round(num),
  sin: (_args, num) => Math.sin(num),
  cos: (_args, num) => Math.cos(num),
  tan: (_args, num) => Math.tan(num),
  base: (_args, num, base) => parseFloat(num).toString(base),
};
