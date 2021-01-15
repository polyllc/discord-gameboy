// load env file
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import bot from './bot'

dotenv.config()


const createCacheFolders = () => {
    process.env.IMG_PATH = process.env.IMG_PATH ?? 'img/'
    process.env.SAVES_PATH = process.env.SAVES_PATH ?? 'saves/'
    process.env.GAMES_PATH = process.env.GAMES_PATH ?? 'games/'

    const folders = [process.env.IMGS_PATH!, process.env.SAVES_PATH!, process.env.GAMES_PATH!]
    folders.forEach((path: string) => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
    })
}
createCacheFolders()
bot.login(process.env.DISCORD_TOKEN)
