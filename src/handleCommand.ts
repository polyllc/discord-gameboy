import * as Discord from 'discord.js'
import { PREFIX } from './constants'
import { commands } from './commands'
import { Command } from './commands/command'

export const handleCommands = async (message: Discord.Message) => {

    if (!message.content.startsWith(PREFIX) || message.author.bot) return

    const args = message.content.slice(PREFIX.length).trim().split(/ +/)
    const commandName = args.shift()?.toLowerCase()

    const command = commands.get(commandName) as Command
        || commands.find((cmd: any) => cmd.aliases?.includes(commandName) ?? false) as Command

    // no command found return
    if (!command) return

    if (message.channel.type === 'dm') // do not reply in dms yet
        return message.reply(`This bot doesn't support playing in dms`)

    if (!message.guild)
        return message.reply(`You must be in a guild to use this bot`)


    let mandatoryArgs = args.filter(e=>{
        return !command.optionalArgs?.includes(e);
    });
    
    if (command.args.length != mandatoryArgs.length) {
        let reply = `Invalid amount of arguments, ${message.author.username}!`

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``
        }

        return message.reply(reply)
    }


    try {
        await command.execute(message, args)
    } catch (error) {
        console.log(error)
        message.reply('Something went wrong.')
    }
}

