import * as Discord from 'discord.js'
import { on_message, messageReactionRemove, messageReactionAdd } from './gameboyController'



const bot = new Discord.Client();



bot.on('ready', () => {
    console.info(`Logged in as ${bot.user?.tag ?? 'unknown'}!`)
})

bot.on('message', on_message)

// TODO: make it load commands instead of checking on_message


export default bot;
