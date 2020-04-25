import { User, GuildMember, ImageSize} from "discord.js";
import compare from "leven";

import { getCreationTime } from "../util";
import { ParserFn } from ".";

export const discordParsers: Record<string, ParserFn> = {
  user: (args, str) => _fn('username', str, args.author, args.members),
  discrim: (args, str) => _fn('discriminator', str, args.author, args.members, { returnValue: true, searchByUsername: true }),
  avatar: (args, str) => _fn('avatarURL', str, args.author, args.members, { returnValue: true, searchByUsername: true }),
  creation: (_args, str) => getCreationTime(str),

  // The parameters for these must be Eris entities
  userid: args => args.author.id,
  mention: args => `<@${args.author.id}>`,
  server: args => args.guild.name,
  serverid: args => args.guild.id,
  servercount: args => args.guild.memberCount,
  servericon: (args, size: ImageSize) => args.guild.iconURL({ size }),
  channel: args => args.channel.name,
  channelid: args => args.channel.id,
  randuser: args => {
    if (!args || !args.members || !Array.isArray(args.members)) throw new Error(`Parameter 'members' for randuser must be an array of Member objects `)
    else {
      const members = args.members.map(u => u.user.username)
      return members[Math.floor(Math.random() * members.length)]
    }
  },
  randonline: args => {
    if (!args || !args.members || !Array.isArray(args.members)) throw new Error(`Parameter 'members' for randonline must be an array of Member objects`)
    else {
      const members = args.members.filter(u => u.presence.status === 'online').map(u => u.user.username)
      return members[Math.floor(Math.random() * args.members.length)] || 'NO USERS ONLINE'
    }
  },
  randchannel: args => {
    if (!args || !args.channels || !Array.isArray(args.channels)) throw new Error(`Parameter 'members' for randchannel must be an array of TextChannel objects`)
    else {
      const channels = args.channels.map(c => c.name)
      return channels[Math.floor(Math.random() * channels.length)]
    }
  }
}

interface Options {
  returnValue: boolean;
  searchByUsername: boolean;
}

function sift(list: Array<User | GuildMember>): User[] {
  return list.reduce((l, c) => {
    l.push(c instanceof User ? c : c.user);
    return l;
  }, []);
}

function callFnOrReturn(key: string, value: {}) {
  // @ts-ignore
  return typeof value[key] === "function" ? value[key]() : value[key];
}

function _fn(
  key: keyof User,
  search: string,
  author: User,
  list: any[],
  options?: Options
) {
  if (!search) return callFnOrReturn(key, author);
  else if (!Array.isArray(list))
    throw new Error(
      `Parameter 'list' for user/nick/discrim/avatar must be an array of Member objects`
    );
  else {
    list = sift(list);

    let l = list.map((u) => ({
      uname: u.user.username,
      [key]: callFnOrReturn(key, u),
    }));
    let matches: { value: any; distance: number }[] = [];

    l.map((i) => {
      const comparison =
        options && options.searchByUsername
          ? compare(search, i.uname)
          : compare(search, i[key]);

      if (comparison !== -1) {
        options && options.returnValue
          ? matches.push({ value: i[key], distance: comparison })
          : matches.push({ value: i.uname, distance: comparison });
      }
    });

    matches = matches
      .sort((a, b) => b.distance - a.distance)
      .map((m) => m.value); // Distance based sort, then map to return value
    return matches[0] || "NO MATCH";
  }
}
