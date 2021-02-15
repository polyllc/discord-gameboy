import * as Discord from 'discord.js'
import ServerEmulator from '../serverEmulator'
import ServerMap from '../serverMap'
import { Command } from './command'


const stop: Command = {
    name: 'stop',
    aliases: ['stop_emu', 'stopemu', 'stp'],
    args: [],
    description: 'Stops the emulator.',
    execute: async (message: Discord.Message, args: string[]) => {
        const emulator = ServerMap.getEmulator(message.guild!.id)
        if (!emulator)
            return message.reply(`You need to have a running emulator first.`)


        ServerMap.destroyEmulator(message.guild!.id)
        message.channel.send(`Emulator stopped successfully.`)
    }
}

export default stop

