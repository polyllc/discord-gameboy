//@ts-nocheck
// disable type checking for now until this is clean
import * as request from 'request'
import * as Discord from 'discord.js'
import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gifencoder'
import Gameboy from 'gameboy'
import * as fs from 'fs'

import { ModeEnum, defaultCanvasHeight, defaultCanvasWidth, IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'

let canvas;
let serverList = new Map(); //creates a map that will hold all the data for each emulator instance
let serverEmu = 1;

let canvasWidth = defaultCanvasWidth;
let canvasHeight = defaultCanvasHeight;

function start(se) { //starting and restarting the emulator
    se.canvas = createCanvas(canvasWidth, canvasHeight);
    se.ctx = se.canvas.getContext('2d');
    clearLastEmulation(se);
    se.gb = new Gameboy(se.canvas, se.dat, undefined);
    se.gb.start();
    run(se);
}

//for later information, se stands for Server Emulator

//reaction stuff
function startGame(message: Discord.Message, rom, romname) { //starts the game in one of 3 modes
    message.channel.send(
        "Start the game in\n"
        + "`1` - Community mode, everyone can control the game with messages, no reactions\n"
        + "`2` - Hybrid mode, everyone can control with messages, you can control with reactions\n"
        + "`3` - Personal mode, you can control with messages or reactions, no one else can\n"
        + "`4` - Continuous-frame mode, like mode 1 but frame images are not deleted\n"
    ).then(() => {
        const filter = m => message.author.id === m.author.id;

        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (Number.isInteger(parseInt(messages.first().content))) {
                    const mode = parseInt(messages.first().content);
                    console.log("DEBUG: mode:" + mode);
                    switch (mode) {
                        case 1: case 4:
                            message.channel.send("Starting game in" + (mode == 1) ? "Community" : "Continuous-frame" + " mode... this takes about 3 seconds to process the first 100 frames");
                            var emuCon = {
                                gb: null, //the gameboy instance
                                canvas: createCanvas(144, 160), //the canvas for the gameboy
                                ctx: null, //the ctx needed for gif creation
                                int: null, // the interval for frams
                                ctxint: null, //the interval for the ctx for the gifs
                                gifint: null, //the interval to create gifs (just so if no one is pressing any buttons, the game at least sometimes spits out frames to discored)
                                frames: 0, //the amount of frames created, only needed for error handling
                                mainmess: null, //the main message that the bot creates for the emulation, kinda like the container for the emulation in the form of the message
                                makeGif: false, //should it be making a gif?
                                gif: null, //the gif object would be here
                                romname: romname, //the name of the rom, the file name too
                                id: "g" + message.guild.id, //the key of the map, used to uniquely identify saves 
                                chid: message.channel.id, //the channel id to check for new commands
                                dat: rom, //the data of the rom
                                mode: mode, //the mode that was selected, community, hybrid, personal
                                gifLen: 650, //the length of the gifs, essentially how long will the gifs grab information from ctx
                                gifRate: 10000, //the create gif interval rate
                                imgOrGif: "gif", //the default method for frames, should it post an image or a gif 
                                uid: 0 //the user id of the user in personal mode
                            }
                            serverList.set("g" + message.guild.id, emuCon);
                            var serverEmu = serverList.get("g" + message.guild.id);
                            start(serverEmu);
                            setTimeout(async function () {
                                serverEmu.mainmess = await message.channel.send("game");
                            }, 100);
                            break;

                        case 2:
                            message.channel.send("Type the channel **id** that will be for posting gifs that is required for Hybrid and Personal mode.\nIf you don't know how, you need to enable developer mode in your discord settings: Settings -> Appearance -> Advanced -> Developer Mode\nThen right click the channel and click Copy ID");
                            message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                                .then(messages => {
                                    if (Number.isInteger(parseInt(messages.first().content))) {
                                        if (bot.channels.cache.get(messages.first().content)) {
                                            message.channel.send("Starting game in Hybrid mode... this takes about 3 seconds to process the first 100 frames");
                                            var emuCon = {
                                                gb: null,
                                                canvas: createCanvas(144, 160),
                                                ctx: null,
                                                int: null,
                                                ctxint: null,
                                                gifint: null,
                                                frames: 0,
                                                mainmess: null,
                                                makeGif: false,
                                                gif: null,
                                                romname: romname,
                                                id: "g" + message.guild.id,
                                                chid: message.channel.id, //channel id, for getting input
                                                gid: bot.channels.cache.get(messages.first().content), //channel id for posting gifs
                                                dat: rom, //rom data
                                                mode: mode,
                                                cid: message.author.id, //controller id, who is controlling the emulator with reactions
                                                gifLen: 650,
                                                gifRate: 10000,
                                                imgOrGif: "gif",
                                                uid: 0 //only for mode 3
                                            }
                                            serverList.set("g" + message.guild.id, emuCon);
                                            var serverEmu = serverList.get("g" + message.guild.id);
                                            start(serverEmu);
                                            setTimeout(async function () {
                                                serverEmu.mainmess = await message.channel.send("game");
                                                await serverEmu.mainmess.react("⬆️");
                                                await serverEmu.mainmess.react("⬇️");
                                                await serverEmu.mainmess.react("⬅️");
                                                await serverEmu.mainmess.react("➡️");
                                                await serverEmu.mainmess.react("🅰️");
                                                await serverEmu.mainmess.react("🅱️");
                                                await serverEmu.mainmess.react("745361595240022066");
                                                await serverEmu.mainmess.react("745361584783884391");
                                            }, 100);
                                        }
                                        else {
                                            message.channel.send("That channel id does not exist");
                                        }
                                    }
                                    else {
                                        message.channel.send("That isn't a valid channel ID");
                                    }
                                });
                            break;
                        case 3:
                            message.channel.send("Type the channel **id** that will be for posting gifs that is required for Hybrid and Personal mode.\nIf you don't know how, you need to enable developer mode in your discord settings: Settings -> Appearance -> Advanced -> Developer Mode\nThen right click the channel and click Copy ID");
                            message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                                .then(messages => {
                                    if (Number.isInteger(parseInt(messages.first().content))) {
                                        if (bot.channels.cache.get(messages.first().content)) {
                                            message.channel.send("Starting game in Personal mode... this takes about 3 seconds to process the first 100 frames");
                                            var emuCon = {
                                                gb: null,
                                                canvas: createCanvas(144, 160),
                                                ctx: null,
                                                int: null,
                                                ctxint: null,
                                                gifint: null,
                                                frames: 0,
                                                mainmess: null,
                                                makeGif: false,
                                                gif: null,
                                                romname: romname,
                                                id: "u" + message.author.id,
                                                chid: message.channel.id, //channel id, for getting input
                                                gid: bot.channels.cache.get(messages.first().content), //channel id for posting gifs
                                                dat: rom, //rom data
                                                mode: mode,
                                                cid: message.author.id, //controller id
                                                gifLen: 650,
                                                gifRate: 10000,
                                                imgOrGif: "gif",
                                                uid: message.author.id
                                            }
                                            serverList.set("u" + message.author.id, emuCon);
                                            var serverEmu = serverList.get("u" + message.author.id);
                                            start(serverEmu);
                                            setTimeout(async function () {
                                                serverEmu.mainmess = await message.channel.send("game");
                                                await serverEmu.mainmess.react("⬆️");
                                                await serverEmu.mainmess.react("⬇️");
                                                await serverEmu.mainmess.react("⬅️");
                                                await serverEmu.mainmess.react("➡️");
                                                await serverEmu.mainmess.react("🅰️");
                                                await serverEmu.mainmess.react("🅱️");
                                                await serverEmu.mainmess.react("745361595240022066");
                                                await serverEmu.mainmess.react("745361584783884391");
                                            }, 100);
                                        }
                                        else {
                                            message.channel.send("That channel id does not exist");
                                        }
                                    }
                                    else {
                                        message.channel.send("That isn't a valid channel ID");
                                    }
                                });
                            break;
                        default:
                            message.channel.send("Type a valid option next time");
                    }
                }
                else {
                    message.channel.send("Use a number to select");
                }
            })
            .catch(() => {
                message.channel.send("You didn't specify the type of emulation");
            });
    });
}


async function run(se) {
    if (GameBoyEmulatorInitialized(se)) { //checks if it has started (which would be an error if it didn't and there would be a bug elsewhere)
        if (!GameBoyEmulatorPlaying(se)) {
            se.gb.stopEmulator &= 1; //initial startup of the gameboy
            var dateObj = new Date();
            se.gb.firstIteration = dateObj.getTime();
            se.gb.iterations = 0;
            se.int = setInterval(function () {
                se.gb.run(); //runs each frame one by one with this function
            }, 4);
            se.ctxint = setInterval(function () { //the interval for saving the images to a gif or saving an image to disk, setting the interval speed could improve or degrade performance
                var base64Data = se.canvas.toDataURL().replace(/^data:image\/png;base64,/, "");
                fs.writeFile(IMG_PATH + se.id + "img.png", base64Data, 'base64', function (err) {

                });
                if (se.makeGif) {
                    se.gif.addFrame(se.ctx);
                    se.frames++;

                }
            }, 20);
            se.gifint = setInterval(function () {
                sendImage(se, se.imgOrGif);
            }, se.gifRate);
        }
        else {
            console.log("already running");
        }
    }
    else {
        console.log("hasn't been started");
    }
}

async function sendImage(se, type = "gif") { //i know, i should be using an enum
    var channel = se.mainmess.channel;
    if (!se.makeGif && type == "gif") { //checks if its not already creating a gif, so it doesn't overlap
        se.gif = new GIFEncoder(defaultCanvasWidth, defaultCanvasHeight);
        se.gif.createReadStream().pipe(fs.createWriteStream('img/' + se.id + 'img.gif'));
        se.gif.start();
        se.gif.setRepeat(-1);
        se.gif.setDelay(0);
        se.gif.setFrameRate(30);
        se.makeGif = true;
        setTimeout(async function () {
            se.gif.finish();
            console.log("... poof!");
            if (se.frames != 0 && se.mainmess != null) {
                se.makeGif = false;
                if (se.mode == ModeEnum.community) {
                    se.mainmess.delete();
                    se.mainmess = await channel.send({ files: [{ attachment: IMG_PATH + se.id + "img.gif" }] });
                } else if (se.mode == ModeEnum.continuous) {
                    se.mainmess = await channel.send({ files: [{ attachment: IMG_PATH + se.id + "img.gif" }] });
                }
                else { //edits
                    var pid = await se.gid.send({ files: [{ attachment: IMG_PATH + se.id + "img.gif" }] });
                    se.mainmess.edit(pid.attachments.first().url);
                }
            }
            else {
                console.log("Emulator didn't draw frames");
            }
        }, se.gifLen);
    }
    else if (type == "img") {
        if (se.mode == ModeEnum.continuous) {
            se.mainmess.delete();
            se.mainmess = await channel.send({ files: [{ attachment: IMG_PATH + se.id + "img.png" }] });
        } else if (se.mode == ModeEnum.continuous) {
            se.mainmess = await channel.send({ files: [{ attachment: IMG_PATH + se.id + "img.png" }] });
        }
        else {
            var pid = await se.gid.send({ files: [{ attachment: IMG_PATH + se.id + "img.png" }] });
            se.mainmess.edit(pid.attachments.first().url);
        }
    }
}


function saveSRAM(message, se) { //saves the sram to a file, currently, restoring the sram does not work, but it's not that important as save states do
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        fs.writeFile(SAVES_PATH + se.id + "sram_" + se.romname, JSON.stringify(se.gb.saveSRAMState()).substr(1, JSON.stringify(se.gb.saveSRAMState()).length - 2), function (err) {
            if (message) {
                message.channel.send("Saved SRAM data");
            }
        });
    }
    else if (message) {
        message.channel.send("The emulator isn't running");
    }
}

function save(message, se) { //save the state that the emulator is in
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        fs.writeFile(SAVES_PATH + se.id + "save_" + se.romname, JSON.stringify(se.gb.saveState()).substr(1, JSON.stringify(se.gb.saveState()).length - 2), function (err) {
            if (message) {
                message.channel.send("Saved data");
            }
        });
    }
    else if (message) {
        message.channel.send("The emulator isn't running");
    }
}




function matchKey(key) {	//Maps a keyboard key to a gameboy key.
    //Order: Right, Left, Up, Down, A, B, Select, Start
    var keymap = ["r", "l", "u", "d", "a", "b", "select", "start"];	//Keyboard button map.
    for (var index = 0; index < keymap.length; index++) {
        if (keymap[index] == key) {
            return index;
        }
    }
    return -1;
}
function GameBoyEmulatorInitialized(se) {
    return (typeof se.gb == "object" && se.gb != null);
}
function GameBoyEmulatorPlaying(se) {
    return ((se.gb.stopEmulator & 2) == 0);
}
function GameBoyKeyDown(key, se) {
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        GameBoyJoyPadEvent(matchKey(key), true, se);
    }
}
function GameBoyJoyPadEvent(keycode, down, se) {
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        if (keycode >= 0 && keycode < 8) {
            se.gb.JoyPadEvent(keycode, down);
        }
    }
}
function GameBoyKeyUp(key, se) {
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        GameBoyJoyPadEvent(matchKey(key), false, se);
    }
}

function clearLastEmulation(se) {
    if (GameBoyEmulatorInitialized(se) && GameBoyEmulatorPlaying(se)) {
        clearInterval(se.int);
        clearInterval(se.ctxint);
        clearInterval(se.gifint);
        se.gb.stopEmulator |= 2;
        se.gb = null;
    }
}

function openSRAM(filename, canvas, message, se) {
    try {
        if (fs.existsSync(filename)) {
            try {
                //this actually doesn't work, but I'll prentend like i didn't hear that
                se.gb.MBCRam = se.gb.toTypedArray(twodSplit(fs.readFileSync(SAVES_PATH + (se.mode == 3 ? "u" : "g") + se.id + "sram_" + se.romname, { encoding: "utf8" })), "uint8");
                message.channel.send("Restored SRAM data");
            }
            catch (error) {
                console.log(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
            }
        }
        else {
            console.log("Could not find the save state " + filename + "\".");
        }
    }
    catch (error) {
        console.log("Could not open the saved emulation state. " + error);
    }
}

function openState(filename, canvas, message, se) {
    try {
        if (fs.existsSync(SAVES_PATH + se.id + "save_" + se.romname)) {
            try {
                clearLastEmulation(se);
                se.gb = new Gameboy(se.canvas, se.dat, undefined);
                se.gb.returnFromState(twodSplit(fs.readFileSync(SAVES_PATH + se.id + "save_" + se.romname, { encoding: "ascii" }))); //the save state loading
                //gb.start();
                run(se);
                message.channel.send("Restored save point data");
            }
            catch (error) {
                console.log(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
            }
        }
        else {
            console.log("Could not find the save state " + filename + "\".");
        }
    }
    catch (error) {
        console.log("Could not open the saved emulation state. " + error);
    }
}

function reset(message, se) {
    if (GameBoyEmulatorInitialized(se)) {
        try {
            start(se);
            message.channel.send("Reset Emulation");
        } catch (error) {
            message.channel.send(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
        }
    } else {
        message.channel.send("Could not restart, as a previous emulation session could not be found.", 1);
    }
}

function format2D(a) { //puts the savestate in a friendly file format
    var str = "";
    for (var i = 0; i < a.length; i++) {
        if (typeof a[i] == Array || typeof a[i] == TypedArray) {
            str += "[" + a[i].toString() + "],";
        }
        else {
            str += a[i] + ",";
        }
    }
    str = str.substr(0, str.length - 1);
    return str;
}

function twodSplit(strr) { //i have no idea why this works, but if it works, im not complaining. Replacement for the bad JSON.parse for parsing files for save states
    var str = strr;
    var arr = [];
    for (var i = 0; i < 1; i++) {
        if (str.length > 0) {
            if (str.substr(0, 1) == ",") {
                str = str.substr(1);
            }
            if (str.substr(0, 1) != "[") {
                var sArr = str.substr(0, str.indexOf(",[") - 1 < 0 ? str.length : str.indexOf(",[")).split(",");
                for (var j = 0; j < sArr.length; j++) {
                    if (sArr[j] == "true") {
                        sArr[j] = true;
                    }
                    else if (sArr[j] == "false") {
                        sArr[j] = false;
                    }
                    else if (Number.isInteger(parseInt(sArr[j]))) {
                        sArr[j] = parseInt(sArr[j]);
                    }
                    else {
                        sArr[j] = sArr[j].replace("/\"/g", "");
                    }
                }
                arr = arr.concat(sArr);
                str = str.substr(str.indexOf("[") + 1);
            }
            else {
                str = str.substr(1);
            }
            if (str.length > 0) {
                if (str.substr(0, 1) != "]") {
                    var twodstr = str.substr(0, str.indexOf("]"));
                    var nArr = twodstr.split(",");
                    if (nArr[0] != null && nArr[0] != "") {
                        for (var j = 0; j < nArr.length; j++) {
                            if (nArr[j] == "true") {
                                nArr[j] = true;
                            }
                            else if (nArr[j] == "false") {
                                nArr[j] = false;
                            }
                            else if (Number.isInteger(parseInt(nArr[j]))) {
                                nArr[j] = parseInt(nArr[j]);
                            }
                            else {
                                nArr[j] = nArr[j].replace("/\"/g", "");
                            }
                        }
                        arr.push(nArr);
                        str = str.substr(str.indexOf("]") + 1);
                        i--;
                    }
                }
                else {
                    arr.push(new Array(1));
                    str = str.substr(1);
                    i--;
                }
            }
        }
    }
    arr.filter(function (el) {
        return el != "";
    });

    return arr;
}


export const on_message = async message => {

    if (message.content.toLowerCase().startsWith("gameboy help")) {
        message.channel.send("Controls:\nA - a\nB - b\nSTART - start\nSELECT - select\nDpad Up - u\nDpad Down - d\nDpad Left - l\nDpad Right - r\n\nCommands:\nload rom {rom file uploaded} - loads the uploaded rom\nsave - saves emulator state\nload - loads previous saved state\nreset - resets emulation\nstop - stops emulation\nchange display type - changes whether to use images or gifs for frames\nchange gif length - the length of how long gifs should be grabbing frames\nchange gif rate - the rate at which gifs are naturally sent\ng - update gif now\nf - update frame now");
    }

    var serverEmu = serverList.get("g" + message.guild?.id);
    if (!serverEmu) {
        serverEmu = serverList.get("u" + message.author.id);
    }

    if (!serverEmu) {
        if (message.content == "load rom") {
            console.log(message.attachments);
            if (message.attachments.size > 0) { //checks if a file was uploaded, \/ checks if its a gameboy or a gameboy color rom
                if (message.attachments.first().name.substr(message.attachments.first().name.length - 3, message.attachments.first().name.length - 1) == "gbc" || message.attachments.first().name.substr(message.attachments.first().name.length - 3, message.attachments.first().name.length - 1) == ".gb") {
                    await request.get(message.attachments.first().url) //downloads the rom
                        .on('error', console.error)
                        .pipe(fs.createWriteStream('games/' + message.attachments.first().name))
                    setTimeout(function () { //just to make sure that the file actually was downloaded
                        startGame(message, fs.readFileSync(GAMES_PATH + message.attachments.first().name), message.attachments.first().name);
                    }, 2000);
                }
                else {
                    message.reply("rom not valid");
                }
            }
            else {
                message.reply("upload a rom too");
            }
        } else if (message.content == "load test rom") {
            let debugMode = process.env.DEBUG_MODE

            if (!debugMode) {
                message.reply("not in debug mode");
                return;
            }
            try {
                let romPath = process.env.TEST_ROM_PATH
                startGame(message, fs.readFileSync(romPath), "test rom");
            } catch (err) {
                console.log(err)
                message.reply("could not load test rom");
            }
        }
    }
    if (serverEmu) {
        if (message.channel.id == serverEmu.chid) {
            if (message.author.id == serverEmu.uid && serverEmu.mode == 3 || serverEmu.mode != 3) { //checks if its in mode 3 and the user id is the same as uid in serverEmu to make the emulator "personal"
                let command = message.content.toLowerCase();
                //checking message.content is the only way to get commands

                if (command.startsWith("change display type")) {
                    var type = command.split(" ")[3];
                    if (type == "img" || type == "gif") {
                        serverEmu.imgOrGif = type;
                        message.channel.send("Set type to " + type);
                    }
                    else {
                        message.channel.send("Not a valid type, use img or gif");
                    }
                }

                if (command.startsWith("change gif rate")) {
                    var type = parseInt(command.split(" ")[3]);
                    if (Number.isInteger(parseInt(type))) {
                        type = parseInt(type);
                        if (type > 1000) {
                            if (type < 100000) {
                                clearInterval(serverEmu.gifint);
                                serverEmu.gifRate = type;
                                serverEmu.gifint = setInterval(function () {
                                    sendImage(serverEmu, serverEmu.imgOrGif);
                                }, serverEmu.gifRate);
                                message.channel.send("Set gif rate to " + type + "ms");
                            }
                            else {
                                message.channel.send("Number is too high, needs to be lower than 100,000ms (100s)");
                            }
                        }
                        else {
                            message.channel.send("Number is too low, needs to be higher than 1000ms (as per discord requirements, bots cannot send messages at a rate higher than 1 message per second)");
                        }
                    }
                    else {
                        message.channel.send("Not a valid number");
                    }
                }

                if (command.startsWith("change gif length")) {
                    var type = command.split(" ")[3];
                    if (Number.isInteger(parseInt(type))) {
                        type = parseInt(type);
                        if (type > 60) {
                            if (type < 100000) {
                                serverEmu.gifLen = type;
                                message.channel.send("Set gif length to " + type + "ms");
                            }
                            else {
                                message.channel.send("Number is too high, needs to be lower than 100,000ms (100s)");
                            }
                        }
                        else {
                            message.channel.send("Number is too low, needs to be higher than 60ms");
                        }
                    }
                    else {
                        message.channel.send("Not a valid number");
                    }
                }

                if (command == "f") {
                    sendImage(serverEmu, "img");
                    message.delete();
                }
                if (command == "g") {
                    sendImage(serverEmu, "gif");
                    message.delete();
                }
                if (command == "stop") {
                    clearLastEmulation(serverEmu);
                    serverList.delete((serverEmu.mode == 3 ? "u" : "g") + message.guild.id);
                    message.channel.send("Stopped emulation");
                }
                if (command == "save sram") {
                    saveSRAM(message, serverEmu);
                    message.delete();
                }
                if (command == "load sram") {
                    openSRAM(SAVES_PATH + (serverEmu.mode == 3 ? "u" : "g") + serverEmu.id + "save_" + romname, canvas, message, serverEmu);
                    message.delete();
                }
                if (command == "save") {
                    save(message, serverEmu);
                    message.delete();
                }
                if (command == "load") {
                    openState(serverEmu.id + "save_" + serverEmu.romname, canvas, message, serverEmu);
                    message.delete();
                }
                if (command == "reset") {
                    reset(message, serverEmu);
                    message.delete();
                }
                if (matchKey(command) != -1) {
                    if (GameBoyEmulatorInitialized(serverEmu) && GameBoyEmulatorPlaying(serverEmu)) {
                        GameBoyKeyDown(command, serverEmu);
                        sendImage(serverEmu, serverEmu.imgOrGif);
                        message.delete();
                        setTimeout(function () {
                            GameBoyKeyUp(command, serverEmu);
                        }, 100);
                    }
                    else {
                        message.channel.send("The emulator isn't running");
                    }
                }
                if (command.startsWith("SET SIZE")) {
                    var splitted = command.split(' ');
                    if (splitted.length == 4) {
                        defaultCanvasWidth = parseInt(splitted[2]);
                        defaultCanvasHeight = parseInt(splitted[3]);
                    }
                }
            }
        }
    }

}


export const messageReactionRemove = (reaction, user) => {
    const se = serverList.get("g" + reaction.message.guild.id);
    if (!se) {
        se = serverList.get("u" + user.id);
    }
    if (se) {
        if (reaction.message.id == se.mainmess) { //checks if the reaction was on the emulator message
            if (user.id == se.cid) { //checks if the reaction that was added was the controller id
                var key = "nothing";
                if (reaction.emoji.name == "⬆️") {
                    key = "u";
                }
                if (reaction.emoji.name == "⬇️") {
                    key = "d";
                }
                if (reaction.emoji.name == "⬅️") {
                    key = "l";
                }
                if (reaction.emoji.name == "➡️") {
                    key = "r";
                }
                if (reaction.emoji.name == "🅰️") {
                    key = "a";
                }
                if (reaction.emoji.name == "🅱️") {
                    key = "b";
                }
                if (reaction.emoji.name == "start" || reaction.emoji.name == "👍") {
                    key = "start";
                }
                if (reaction.emoji.name == "select") {
                    key = "select";
                }
                if (key != "nothing") {
                    GameBoyKeyUp(key, se);
                }
            }
        }
    }
}


export const messageReactionAdd = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }
    var se = serverList.get("g" + reaction.message.guild.id);
    if (!se) {
        se = serverList.get("u" + user.id);
    }
    if (se) {
        if (reaction.message.id == se.mainmess) {
            if (user.id == se.cid) {
                var key = "nothing";
                if (reaction._emoji.name == "⬆️") {
                    key = "u";
                }
                if (reaction._emoji.name == "⬇️") {
                    key = "d";
                }
                if (reaction._emoji.name == "⬅️") {
                    key = "l";
                }
                if (reaction._emoji.name == "➡️") {
                    key = "r";
                }
                if (reaction._emoji.name == "🅰️") {
                    key = "a";
                }
                if (reaction._emoji.name == "🅱️") {
                    key = "b";
                }
                if (reaction._emoji.name == "start" || reaction.emoji.name == "👍") {
                    console.log("pressed start");
                    key = "start";
                }
                if (reaction._emoji.name == "select") {
                    key = "select";
                }
                console.log(key);
                if (key != "nothing") {
                    sendImage(se, se.imgOrGif);
                    GameBoyKeyDown(key, se);
                }
            }
        }
    }
}