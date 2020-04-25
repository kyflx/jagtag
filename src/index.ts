import { Guild, GuildChannel, User, GuildMember } from "discord.js";
import XRegExp from "xregexp";

import * as parsers from "./lib";
import { mergeObjects } from "./util";

export interface ParseArguments {
  tagArgs: any[];
  disabledParsers: string[];
  enableLogging: boolean;
  author: User;
  channel: GuildChannel;
  guild: Guild;
  channels: GuildChannel[];
  members: GuildMember[];
}

const matchRecursive = (str: string) =>
  XRegExp.matchRecursive(str, "{", "}", "gi");

export function parse(
  string: string,
  args?: ParseArguments,
  _callback?: (result: string) => any
): string {
  /** Remove Disabled Parsers. */
  let allParsers = mergeObjects(parsers);
  if (args && args.disabledParsers && Array.isArray(args.disabledParsers)) {
    allParsers = args.disabledParsers.map((p) => {
      if (allParsers.hasOwnProperty(p)) delete allParsers[p];
    });
  }

  if (string) {
    const funcRegex = /{(.*?\S(:).*?\S)}/gi; // Regex for {name:param}
    const splitRegex = /:(.+)?/gi; // Splits the tag only at the first colon (URL colon foolproofing)
    const isRootFunc = _callback === undefined;

    let tags = matchRecursive(string);

    // TODO: Recovery from unclosed brace, so that all tags don't break
    if (tags === null) return string;
    // Unclosed tag, return unchanged string
    else tags = tags.map((t) => `{${t}}`); // Restore curly braces for funcRegex to work

    let parsedString = string; // This is modified and eventually returned to the user

    if (tags) {
      for (let tag of tags) {
        let stripped = tag.slice(1, -1); // Remove curly braces

        if (matchRecursive(stripped))
          parse(stripped, args, (_new) => (stripped = _new));

        const tagDef = {
          raw: stripped,
          name:
            tag.match(funcRegex) !== null
              ? String(stripped.split(splitRegex).splice(0, 1))
              : stripped,
          func:
            tag.match(funcRegex) !== null
              ? stripped.split(splitRegex).splice(1, 1)[0].split("|")
              : [],
          // Arguments are separated by pipes which calls for an another split
          // The arguments are in an array from which the name is extracted, hence using the 0th element
        };

        let result;
        try {
          // If parser exists, run function - otherwise leave tag unchanged
          result = allParsers.hasOwnProperty(tagDef.name)
            ? allParsers[tagDef.name](args || null, ...tagDef.func)
            : tag;
        } catch (e) {
          if (args && args.enableLogging) console.error(e);
          result = tag; // If errors are encountered, return unchanged tag
        }

        // Replace tags in the parsed string
        parsedString = parsedString.replaceAll(tag, result);
      }

      if (!isRootFunc) _callback(parsedString);
      else return parsedString;
    }

    return string;
  }

  return undefined;
}

/*
NOTES ABOUT PARSE RECURSION
---------------------------
The if (matchRecursive(stripped)) conditional serves to achieve parsing of nested tags from the deepest tag upwards,
according to the common mathematical algorithm of calcalating the innermost bracket first.
The parse function is called recursively in this conditional. On each iteration, a check is performed if there are
further tags to be found in the already stripped tag. If some are found, the parse function is called again. This
is repeated until the lowermost tag is reached, at which point the if condition no longer fires.
At this point the code starts parsing each tag and performing callbacks, thus working its way up from the bottom.
When the function reaches the point where the _callback function is undefined (isRootFunc), it will return the
complete string.
*/
