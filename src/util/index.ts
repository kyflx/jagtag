import moment from "moment";

export { path as pathFn } from "./path";

export function mergeObjects(
  originObject: Record<string, Record<string, any>>
): Record<string, any> {
  let all = {};
  for (let o in originObject) {
    Object.assign(all, originObject[o]);
  }
  return all;
}

// Safe comparison for string-based if conditions
export function safeCompare(
  item1: any,
  conditional: string,
  item2: any
): boolean | RegExp {
  switch (conditional) {
    // Built-in
    case ">":
      return item1 > item2;
    case "<":
      return item1 < item2;
    case ">=":
      return item1 >= item2;
    case "<=":
      return item1 <= item2;
    case "==":
      return item1 == item2; // eslint-disable-line eqeqeq
    case "===":
      return item1 === item2;
    case "!=":
      return item1 != item2; // eslint-disable-line eqeqeq
    case "!==":
      return item1 !== item2;
    // Custom
    case "?":
      return new RegExp(item2, "g").exec(item1) !== null;
    default:
      return false;
  }
}

export function getCreationTime(snowflake: string): moment.Moment {
  // Shamelessly nicked this code from https://github.com/qeled/discordie
  let formatted = +snowflake / 4194304 + 1420070400000;
  return moment(new Date(+formatted)).utc();
}

/** Prototyping */
String.prototype.replaceAll = function (searchFor, replaceWith) {
  return this.split(searchFor).join(replaceWith);
};

String.prototype.hashCode = function () {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

declare global {
  interface String {
    replaceAll(searchFor: string, replaceWith: string): string;
    hashCode(): number;
  }
}
