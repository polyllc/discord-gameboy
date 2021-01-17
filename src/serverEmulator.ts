import * as request from 'request'
import * as Discord from 'discord.js'
import { Canvas, createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gifencoder'
import { GameBoy } from 'jsgbc'
import * as fs from 'fs'
import { ModeEnum, defaultCanvasHeight, defaultCanvasWidth, IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'



export default class ServerEmulator {
    private canvas: Canvas
    private gameboy: GameBoy
    private id?: number
    private emulation_message?: Discord.Message
    private emulation_channel?: Discord.TextChannel

    constructor(id?: number) {
        this.id = id
        const canvas = this.canvas = new Canvas(defaultCanvasWidth, defaultCanvasHeight)
        this.gameboy = new GameBoy({
            lcd: {
                canvas,
                offscreenCanvas: new Canvas(defaultCanvasWidth, defaultCanvasHeight)
            },
            isSoundEnabled: false
        });
    }

    /**
     * Helper function to load ROM from path
    */
    public loadROM(path: string) {
        const buffer = fs.readFileSync(path)
        this.gameboy.replaceCartridge(buffer)
    }

    public getGameboy() {
        return this.gameboy
    }

    public getCanvas() {
        return this.canvas
    }
}
