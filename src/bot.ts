import * as Discord from 'discord.js'
import { on_message } from './gameboyController'
import { handleCommands } from './handleCommand';



const bot = new Discord.Client();



bot.on('ready', () => {
    console.info(`Logged in as ${bot.user?.tag ?? 'unknown'}!`)
})

bot.on('message', message => {
    // TODO: add all commands, then make on message control gameplay and mentions
    //on_message(message)
    handleCommands(message)
})


export default bot;
