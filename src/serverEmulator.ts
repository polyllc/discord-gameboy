import * as request from 'request'
import * as Discord from 'discord.js'
import { Canvas, createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas'
import GIFEncoder from 'gifencoder'
import { GameBoy } from 'jsgbc'
import * as fs from 'fs'
import { ModeEnum, defaultCanvasHeight, defaultCanvasWidth, defaultGIFLength, IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'
import { clearInterval, setInterval } from 'timers'



export default class ServerEmulator {
    private canvas: Canvas
    private canvasContext: CanvasRenderingContext2D
    private gameboy: GameBoy

    private fps = 30

    // ids
    private guild: Discord.Guild
    private message: Discord.Message
    private channel: Discord.TextChannel
    private sendMode?: ModeEnum

    // canvas
    private width: number
    private height: number

    // gif
    private encoder: GIFEncoder
    private gifInterval?: NodeJS.Timeout
    private sendInterval?: NodeJS.Timeout
    private gifLength: number


    constructor(server_id: Discord.Guild, message_id: Discord.Message, channel_id: Discord.TextChannel) {
        this.guild = server_id
        this.message = message_id
        this.channel = channel_id

        this.width = defaultCanvasWidth
        this.height = defaultCanvasHeight
        this.gifLength = defaultGIFLength

        this.encoder = new GIFEncoder(this.width, this.height)
        this.encoder.setDelay(1000 / this.fps)
        this.encoder.setQuality(10)
        this.encoder.setRepeat(0)

        const canvas = this.canvas = new Canvas(defaultCanvasWidth, defaultCanvasHeight)
        this.canvasContext = canvas.getContext('2d')
        this.gameboy = new GameBoy({
            isPaused: true,
            lcd: {
                canvas,
                offscreenCanvas: new Canvas(defaultCanvasWidth, defaultCanvasHeight)
            },
            isSoundEnabled: false
        })
    }

    /**
     * Helper function to load ROM from path
    */
    public loadROM(path: string) {
        const buffer = fs.readFileSync(path)
        this.gameboy.replaceCartridge(buffer)
    }

    public start() {
        if (!this.sendMode)
            return false
        this.gameboy.turnOn()
        this.gifInterval = setInterval(() => {
            this.encoder?.addFrame(this.canvasContext)
        }, 1000 / this.fps) // 30 fps
        this.sendInterval = setInterval(() => {
            this.sendImage()
        }, this.gifLength)
        return true
    }

    async sendImage() {
        const gif = await this.getImage()

        switch (this.sendMode) {
            case ModeEnum.delete:
                await this.message.delete()
                this.message = await this.channel.send({ content: gif })
                break
            case ModeEnum.continuous:
                this.message = await this.channel.send({ content: gif })
                break
            case ModeEnum.edit:
                await this.message.edit({ content: gif })
                break
        }

    }
    /**
     * creates the gif
     */
    private async getImage() {
        if (this.gameboy.isPaused() || !this.gameboy.isOn) return null

        const reader = this.encoder.createReadStream()
        this.encoder.start()
        // sleep for gif length
        await new Promise(resolve => setTimeout(resolve, this.gifLength))
        this.encoder.finish()
        // TOOD figure out how to get image
        return 'test'

    }

    public getGameboy() {
        return this.gameboy
    }

    public getCanvas() {
        return this.canvas
    }

    public destroy() {
        if (this.gifInterval)
            clearInterval(this.gifInterval)
        if (this.sendInterval)
            clearInterval(this.sendInterval)
    }

    public setSendMode(sendMode: ModeEnum) {
        this.sendMode = sendMode
    }

    public getSendMode(sendMode: ModeEnum) {
        this.sendMode = sendMode
    }
}
