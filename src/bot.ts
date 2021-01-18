import * as Discord from 'discord.js'
import { on_message } from './gameboyController'
import { handleCommands } from './handleCommand';



const bot = new Discord.Client();



bot.on('ready', () => {
    console.info(`Logged in as ${bot.user?.tag ?? 'unknown'}!`)
})

bot.on('message', message => {
    on_message(message)
    handleCommands(message)
})

// TODO: make it load commands instead of checking on_message


export default bot;
