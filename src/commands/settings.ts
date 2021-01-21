import * as Discord from 'discord.js'
import axios from 'axios'
import settingsMap from '../SettingsMap'
import { Command } from './command'
const settings: Command = {
    name: 'settings',
    aliases: ['sts'],
    args: ['mode'],
    description: 'Settings',
    execute: async (message: Discord.Message, args: string[]) => {
        const mode : string = args[0]
        const key : string = args[1]
        if (mode == 'set'){
            if (!settingsMap.has(key)){
                message.channel.send(`Unknown setting`)
                return 
            }
            if (args.length != 3){
                message.channel.send(`Please provide key and value`)
                return
            }
            
            const value : string = args[2]
            settingsMap[key] = value

            message.channel.send(`${message.author.username} set ${key} to ${value}`)
        }

        if (mode == 'get'){
            if (!settingsMap.has(key)){
                message.channel.send(`Unknown setting`)
                return 
            }

            const value = settingsMap.get(key)
            message.channel.send(`${message.author.username} ${key}: ${value}`)
        }

        if (mode == 'list'){
            console.log( settingsMap.keys())
            let msg : string = (Array.from(settingsMap.keys()).map(key=>{
                return `${key}: ${settingsMap.get(key)}` 
            })).join('\n')
            message.channel.send(msg)
        }
    }
}

export default settings