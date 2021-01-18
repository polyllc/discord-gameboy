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


    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``
        }

        return message.channel.send(reply)
    }


    try {
        command.execute(message, args)
    } catch (error) {
        message.reply('error happened')
    }
}

