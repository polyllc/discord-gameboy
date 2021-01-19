import * as Discord from 'discord.js'
import { onMessage } from './onMessage'
import { handleCommands } from './handleCommand';



const bot = new Discord.Client()



bot.on('ready', () => {
    console.info(`Logged in as ${bot.user?.tag ?? 'unknown'}!`)
})

bot.on('message', message => {
    if (message.author.id == bot.user?.id || message.author.bot)
        return

    onMessage(message)
    handleCommands(message)
})


export default bot;
