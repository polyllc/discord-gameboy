import * as Discord from 'discord.js'
import serverMap from './serverMap'


const handleInput = async (message: Discord.Message) => {
    // for now anyone in the guild can play
    const guild = message.guild?.id
    if (!guild)
        return

    const emulator = serverMap.getEmulator(guild)
    if (!emulator)
        return

    if (!emulator.isStarted)
        return

    await emulator.onPress(message.content)
}


export const onMessage = async (message: Discord.Message) => {

    await handleInput(message)
}
