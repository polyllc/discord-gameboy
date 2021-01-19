import * as Discord from 'discord.js'


export interface Command {
    name: string,
    description: string,
    aliases: string[],
    args: string[],
    usage?: string,
    cooldown?: number,
    optionalArgs?: string[],
    execute: (message: Discord.Message, args: string[]) => Promise<any>
}
