import * as Discord from 'discord.js'
import axios from 'axios'
import ServerEmulator from '../serverEmulator'
import ServerMap from '../serverMap'
import { Command } from './command'

/**
 * Downloads and validates the rom
 */
const getRom = async (file: Discord.MessageAttachment) => {
    if (!(file.name?.endsWith('.gb') || file.name?.endsWith('.gbc')))
        throw new Error('Invalid rom format.')

    if (file.size > Math.pow(10, 8)) // TODO actually figure out what size most roms are
        throw new Error('ROM size is too big.')

    let rom: ArrayBuffer
    try {
        rom = (await axios.get(file.url, {
            responseType: 'arraybuffer'
        })).data
    } catch (e: unknown) {
        throw new Error('Could not download rom.')
    }

    return rom
}

const load: Command = {
    name: 'load',
    aliases: ['load_rom', 'loadrom', 'lr'],
    args: [],
    description: 'Load a rom attached in the message.',
    execute: async (message: Discord.Message, args: string[]) => {
        if (message.attachments.size < 1) {
            return message.reply(`Please attach a rom of the game.`)
        }

        const rom = message.attachments.first()!

        let romBinary: ArrayBuffer
        try {
            romBinary = await getRom(rom)
        } catch (e: unknown) {
            const error = e as Error
            return message.reply(error.message)
        }

        const guild = message.guild!

        const emulator = new ServerEmulator(guild)

        emulator.loadROM(romBinary)
        ServerMap.createEmulator(guild.id, emulator)

        message.channel.send(`Loaded the ROM ${rom.name}.`)
    }
}

export default load

