import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'
import bot from './bot'

dotenv.config({
    path: path.join(__dirname, '.env')
})


const createCacheFolders = () => {
    const folders = [IMG_PATH, GAMES_PATH, SAVES_PATH]
    folders.forEach((path: string) => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
    })
}

const start = async () => {
    createCacheFolders()
    try {
        const token = process.env.DISCORD_TOKEN
        await bot.login(token)
    } catch (e) {
        console.error(e)
    }
}

start()
