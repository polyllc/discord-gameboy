import * as Discord from 'discord.js'
import ServerMap from '../serverMap'
import { Command } from './command'

const restart: Command = {
    name: 'restart',
    aliases: ['restart_emu', 'restartemu', 'rst'],
    args: [],
    description: 'Rests the Emulator, equivalent to turning it on and off.',
    execute: async (message: Discord.Message, args: string[]) => {

        const emulator = ServerMap.getEmulator(message.guild!.id)
        if (!emulator)
            return message.reply(`You need to have a running emulator first.`)

        emulator.getGameboy().restart()

        return message.channel.send(`Emulator restarted.`)
    }
}
export default restart

