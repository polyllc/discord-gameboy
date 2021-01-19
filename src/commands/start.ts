import * as Discord from 'discord.js'
import ServerMap from '../serverMap'
import { Command } from './command'
import { ModeEnum } from '../constants'


const getGameModePrompt = (canEdit: boolean): string => {

    const prompt = `Start the game in\n\r
        \`${ModeEnum.delete}\` - delete mode\n\r
        \`${ModeEnum.continuous}\` - continuous mode\n\r
        ${canEdit && `\`${ModeEnum.edit}\` - edit mode\n\r`}`

    return prompt
}


const start: Command = {
    name: 'start',
    aliases: ['startemu', 'startrom', 's'],
    args: [],
    description: 'Load a rom attached in the message.',
    execute: async (message: Discord.Message, args: string[]) => {
        // check if a rom is loaded
        const emulator = ServerMap.getEmulator(message.guild!.id)
        if (!emulator)
            return message.reply(`You need to have a running emulator first.`)
        const canEdit = !!process.env.PRIVATE_HOST_CHANNEL

        const prompt = getGameModePrompt(canEdit)

        await message.channel.send(prompt)

        // filter to check if author of the mode message is the same start author
        const filter = (m: Discord.Message) => message.author.id === m.author.id

        let mode: ModeEnum
        try {
            const messages = await message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            const content = messages.first()?.content
            if (!content)
                return message.reply(`Invalid mode`)
            mode = parseInt(content)

        } catch (error: unknown) {
            return message.reply(`Something went wrong, aborting.`)
        }

        const isLegalMode = !!Object.keys(ModeEnum).find((value: string) => ((parseInt(value) == mode)))

        if (!isLegalMode || (mode == ModeEnum.edit && !canEdit))
            return message.reply(`Invalid mode`)

        emulator.setSendMode(mode)

        message.channel.send(`Starting game in \`${Object.keys(ModeEnum).find((key) => ModeEnum[key] == mode)}\` mode.`)

        const channel = message.channel as Discord.TextChannel
        const gameMessage = await channel.send({
            embed: {
                title: 'starting game soon'
            }
        })

        try {
            emulator.start(gameMessage, channel)
        } catch (e: unknown) {
            const error = e as Error
            return message.reply(error.message)
        }

    }
}

export default start

