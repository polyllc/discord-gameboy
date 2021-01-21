import * as Discord from 'discord.js'
import axios from 'axios'
import settingsMap from '../SettingsMap'
import { Command } from './command'
const settings: Command = {
    name: 'settings',
    aliases: ['sts'],
    args: ['mode', 'key'],
    description: 'Settings',
    optionalArgs: ['*'],
    execute: async (message: Discord.Message, args: string[]) => {
        const mode : string = args[0]
        const key : string = args[1]
        if (mode == 'set'){
            if (args.length != 3){
                message.channel.send(`Please provide key and value, ${message.author.username}`)
                return
            }
            
            const value : string = args[2]
            settingsMap[key] = value
            message.channel.send(`${message.author.username} set ${key} to ${value}`)
        }

        if (mode == 'get'){
            const value = settingsMap[key]
            message.channel.send(`${message.author.username} ${key}: ${value}`)
        }

        if (mode == 'list'){
            message.channel.send(`${settingsMap.list()}`)
        }
    }
}

export default settings