import { User, GuildMember} from "discord.js";
import compare from "leven";

import { getCreationTime } from "../util";
import { ParserFn } from ".";

export const discordParsers: Record<string, ParserFn> = {
  user: (args, str) => _fn('username', str, args.author, args.members),
  nick: (args, str) => _fn('nick', str, args.author, args.members, { returnValue: true, searchByUsername: true }),
  discrim: (args, str) => _fn('discriminator', str, args.author, args.members, { returnValue: true, searchByUsername: true }),
  avatar: (args, str) => _fn('avatarURL', str, args.author, args.members, { returnValue: true, searchByUsername: true })(),
  creation: (_args, str) => getCreationTime(str),

  // The parameters for these must be Eris entities
  userid: args => args.author.id,
  mention: args => `<@${args.author.id}>`,
  server: args => args.guild.name,
  serverid: args => args.guild.id,
  servercount: args => args.guild.memberCount,
  servericon: args => args.guild.iconURL,
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

function _fn(searchBy: string, searchString: string, author: User, list: (GuildMember)[], options?: Options) {
  // @ts-ignore
  if (!searchString) return author[searchBy]
  else if (!Array.isArray(list)) throw new Error(`Parameter 'list' for user/nick/discrim/avatar must be an array of Member objects`)
  else {
    // @ts-ignore
    let l = list.map(u => ({ uname: u.user.username, [searchBy]: u[searchBy] }))
    let matches: { value: any; distance: number; }[] = []

    l.map(i => {
      const comparison = options && options.searchByUsername 
        ? compare(searchString, i.uname) 
        : compare(searchString, i[searchBy])

      if (comparison !== -1) {
        options && options.returnValue
          ? matches.push({ value: i[searchBy], distance: comparison })
          : matches.push({ value: i.uname, distance: comparison })
      }
    })

    matches = matches.sort((a, b) => b.distance -a.distance).map(m => m.value) // Distance based sort, then map to return value
    return matches[0] || 'NO MATCH'
  }
}
