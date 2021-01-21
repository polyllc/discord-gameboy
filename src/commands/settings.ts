import * as Discord from 'discord.js'
import settingsMap from '../settingsMap'
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
                message.reply(`unknown setting`)
                return 
            }
            if (args.length != 3){
                message.reply(`please provide key and value`)
                return
            }
            
            const value : string = args[2]
            settingsMap.set(key, value)

            message.reply(`set ${key} to ${value}`)
        }

        if (mode == 'get'){
            if (!settingsMap.has(key)){
                message.reply(`unknown setting`)
                return 
            }

            const value = settingsMap.get(key)
            message.reply(`${key}: ${value}`)
        }

        if (mode == 'list'){
            console.log( settingsMap.keys())
            let msg :string = 'all settings:\n' + Array.from(settingsMap.keys()).map(key=>{
                return `${key}: ${settingsMap.get(key)}` 
            }).join('\n')
            message.reply(msg)
        }
    }
}

export default settings