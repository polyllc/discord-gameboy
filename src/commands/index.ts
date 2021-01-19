import { Collection } from 'discord.js'
import Help from './help'
import Load from './load'
import Stop from './stop'
import Restart from './restart'
import Start from './start'

/**
 * Loads all commands and return collection with all commands in compile time
*/
const commandObjects = [
    Help,
    Load,
    Stop,
    Restart,
    Start
]

export const commands = new Collection()

for (const command of commandObjects) {
    commands.set(command.name, command)
}
