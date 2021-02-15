import * as Discord from 'discord.js'
import { Command } from './command'

const help: Command = {
    name: 'help',
    aliases: ['helpme'],
    args: [],
    description: 'List all commands or info about a specific command.',
    execute: (message: Discord.Message, args: string[]) => {
        return message.channel.send(`Controls:\nA - a\nB - b\nSTART - start\nSELECT - select\nDpad Up - u\nDpad Down - d\nDpad Left - l\nDpad Right - r\n\nCommands:\nload rom {rom file uploaded} - loads the uploaded rom\nsave - saves emulator state\nload - loads previous saved state\nreset - resets emulation\nstop - stops emulation\nchange display type - changes whether to use images or gifs for frames\nchange gif length - the length of how long gifs should be grabbing frames\nchange gif rate - the rate at which gifs are naturally sent\ng - update gif now\nf - update frame now`)
    }
}

export default help
