//@ts-nocheck
// disable type checking for now until this is clean
import * as request from 'request'
import * as Discord from 'discord.js'
import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gifencoder'
import Gameboy from 'gameboy'
import * as fs from 'fs'

import { ModeEnum, defaultCanvasHeight, defaultCanvasWidth, IMG_PATH, GAMES_PATH, SAVES_PATH } from './constants'

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



export const on_message = async message => {

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


