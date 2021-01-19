import * as Discord from 'discord.js'
import { Canvas, CanvasRenderingContext2D } from 'canvas'
import * as fs from 'fs'
import GIFEncoder from 'gifencoder'
import { GameBoy } from 'jsgbc'
import { ModeEnum, defaultCanvasHeight, defaultCanvasWidth, defaultGIFLength, IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'
import { clearInterval, setInterval } from 'timers'
import { AudioContext } from 'web-audio-api'
import serverMap from './serverMap'


const getNULLStream = () => {
    if (process.platform == 'win32')
        return fs.createWriteStream("\\\\.\\NUL")
    return fs.createWriteStream('/dev/null')
}

export default class ServerEmulator {
    private readonly canvas: Canvas
    private readonly canvasContext: CanvasRenderingContext2D
    private gameboy: GameBoy

    private fps = 30

    // ids
    private guild: Discord.Guild
    private message?: Discord.Message
    private channel?: Discord.TextChannel
    private sendMode?: ModeEnum
    private editChannel?: Discord.TextChannel

    // canvas
    private readonly width: number
    private readonly height: number

    // gif
    private encoder: GIFEncoder
    private gifInterval?: NodeJS.Timeout
    private sendInterval?: NodeJS.Timeout
    private started: boolean
    private readonly gifLength: number

    constructor(server_id: Discord.Guild) {
        this.guild = server_id

        this.width = defaultCanvasWidth
        this.height = defaultCanvasHeight
        this.gifLength = defaultGIFLength

        // setup the encoder
        this.encoder = this.resetEncoder()

        const context: AudioContext = new AudioContext()
        context.outStream = getNULLStream()

        const canvas = this.canvas = new Canvas(defaultCanvasWidth, defaultCanvasHeight)
        this.canvasContext = canvas.getContext('2d')
        this.gameboy = new GameBoy({
            audio: { context },
            lcd: {
                canvas: this.canvas,
                offscreenCanvas: new Canvas(defaultCanvasWidth, defaultCanvasHeight)
            },
            isSoundEnabled: false
        })
        this.gameboy.turnOff()
        this.started = false
    }

    /**
     * Helper function to load ROM from path
    */
    private async sendImage(): Promise<void> {
        if (!this.message || !this.channel) // sanity check
            throw new Error(`Must set message and channel.`)

        const gif = await this.getImage()
        if (!gif) return

        const attachment = new Discord.MessageAttachment(gif, 'game.gif')
        const embed = new Discord.MessageEmbed()
            .attachFiles([attachment])
            //.setThumbnail('attachment://game.gif')
            .setImage('attachment://game.gif')


        try {
            switch (this.sendMode) {
                case ModeEnum.delete:
                    // send then delete for better experience
                    const newMessage = await this.channel.send(embed)
                    await this.message.delete()
                    this.message = newMessage
                    break
                case ModeEnum.continuous:
                    this.message = await this.channel.send(embed)
                    break
                case ModeEnum.edit:
                    // this is some hack to edit file,
                    // basically send first in some private channel then use link to edit attachement
                    if (!this.editChannel) // sanity check
                        throw new Error(`Cannot use edit mode.`)
                    const gifMessage = await this.editChannel.send(attachment)
                    embed.image = {
                        url: gifMessage.attachments.first()?.url!
                    }
                    await this.message.edit({ embed })
                    break
            }
        } catch (e: unknown) {
            const error = e as Discord.DiscordAPIError
            console.error(error)
            serverMap.destroyEmulator(this.guild.id)
        }


    }
    /**
     * creates the gif
     */
    private async getImage(): Promise<null | Buffer> {
        if (!this.gameboy.isOn) return null

        // sleep for gif length
        //await new Promise(resolve => setTimeout(resolve,))
        this.encoder.finish()

        const reader = this.encoder.createReadStream()
        const chunks: any[] = []
        for await (const chunk of reader) {
            chunks.push(chunk)
        }

        this.encoder = this.resetEncoder()
        return Buffer.concat(chunks)

    }

    public async start(message: Discord.Message, channel: Discord.TextChannel): Promise<void> {
        if (!this.sendMode)
            throw new Error('You need to set SendMode for the emulator')

        this.message = message
        this.channel = channel
        this.started = true

        // hack to edit messages
        const editID = process.env.PRIVATE_HOST_CHANNEL
        if (editID) {
            this.editChannel = await this.message.client.channels.fetch(editID) as Discord.TextChannel
            if (!this.editChannel)
                console.warn(`Couldn't find private channel, editing mode is disabled.`)
        }



        if (!this.gameboy.cartridge)
            throw new Error('ROM has to be loaded to start the emulator')

        this.gameboy.turnOn()
        this.gifInterval = setInterval(() => {
            this.encoder?.addFrame(this.canvasContext)
        }, Math.floor(30)) // 30 fps
        this.sendInterval = setInterval(() => {
            this.sendImage()
        }, this.gifLength)

    }

    public loadROM(rom: ArrayBuffer): void {
        this.gameboy.replaceCartridge(rom)
    }

    private resetEncoder(): GIFEncoder {
        const encoder = new GIFEncoder(this.width, this.height)
        encoder.setDelay(Math.floor(1000 / this.fps))
        encoder.setQuality(10)
        encoder.setRepeat(0)
        encoder.start()

        return encoder
    }

    public async onPress(key: string) {
        const keys = ["right", "left", "up", "down", "a", "b", "select", "start"]
        const keyPressed = keys.includes(key)
        if (!keyPressed) return

        this.gameboy.actionDown(key)
        await new Promise(resolve => setTimeout(resolve, 200)) // wait 1/20 second
        this.gameboy.actionUp(key)
    }

    public restart(): void {
        this.gameboy.restart()
    }

    public isStarted(): boolean {
        return this.started
    }

    public getCanvas(): Canvas {
        return this.canvas
    }

    public destroy(): void {
        if (this.gifInterval)
            clearInterval(this.gifInterval)
        if (this.sendInterval)
            clearInterval(this.sendInterval)
    }

    public setSendMode(sendMode: ModeEnum): void {
        this.sendMode = sendMode
    }

    public getSendMode(sendMode: ModeEnum): void {
        this.sendMode = sendMode
    }
}
