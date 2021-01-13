require('dotenv').config()

import * as Discord from 'discord.js'
import { createCanvas, loadImage } from 'canvas'
import * as fs from 'fs'
import * as request from 'request'
import * as GIFEncoder from 'gifencoder'
import * as dotenv from 'dotenv'
import Gameboy from 'gameboy'

// load env file
dotenv.config({
    path: '.'
})
