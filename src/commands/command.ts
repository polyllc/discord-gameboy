import * as Discord from 'discord.js'


export interface Command {
    name: string,
    description: string,
    aliases?: [string],
    usage?: string,
    cooldown?: number,
    execute: (message: Discord.Message, args: [string]) => Promise<any>
}
