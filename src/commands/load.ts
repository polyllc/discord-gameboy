import * as Discord from 'discord.js'
import axios from 'axios'
import ServerEmulator from '../serverEmulator'
import ServerMap from '../serverMap'
import { Command } from './command'
import fs from 'fs'

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
    optionalArgs: ['test'],
    execute: async (message: Discord.Message, args: string[]) => {
        const loadTestRom: Boolean = !!process.env.DEBUG_MODE && args.includes('test')

        if (!loadTestRom && message.attachments.size < 1) {
            return message.reply(`Please attach a rom of the game.`)
        }

        const guild = message.guild!
        const emulator = new ServerEmulator(guild)
        let romName : string = ""
        if (!loadTestRom){
            const rom = message.attachments.first()!
            let romBinary: ArrayBuffer
            try {
                romBinary = await getRom(rom)
                emulator.loadROM(romBinary)
                romName = rom.name ?? "No rom name"
            } catch (e: unknown) {
                const error = e as Error
                return message.reply(error.message)
            }
        } else {
            const path : string = process.env.TEST_ROM_PATH!
            fs.readFile(path, function (error, data) {
                if (error) {
                    throw error
                }
                emulator.loadROM(data)
                romName = "test rom"
            })
        }

        ServerMap.createEmulator(guild.id, emulator)

        message.channel.send(`Loaded the ROM ${romName}.`)
    }
}

export default load

