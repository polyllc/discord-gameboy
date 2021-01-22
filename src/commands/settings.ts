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
        const guildId : string = message?.guild?.id ?? ""
        
        if (!guildId || !settingsMap.hasGuildSettings(guildId))
            throw 'invalid guild ID'

        if (mode == 'set'){
            if (args.length != 3){
                message.reply(`please provide setting and value`)
                return
            }
            
            const value : string = args[2]
            if (settingsMap.set(guildId, key, value)){
                message.reply(`set ${key} to ${value}`)
            } else {
                message.reply('unknown setting')
            }
        } else if (mode == 'get'){
            if (args.length != 2){
                message.reply(`please provide setting`)
                return
            }
        
            const value = settingsMap.get(guildId, key)

            if (!value){
                message.reply('unknown setting')
                return
            }

            message.reply(`${key}: ${value}`)
        } else if (mode == 'list'){
            message.reply(`all settings:\n${settingsMap.list(guildId)}`)
        }
    }
}

export default settings