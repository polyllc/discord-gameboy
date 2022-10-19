# discord-gameboy
  An emulator that uses discord as its method of input and output. It spits out frames to discord, and receives input from discord.
It supports:
- Unique save states
- Multiple emulators in one instance of a bot, one per user and one per guild
- Custom ROMs
- gifs
- 3 modes of operation, community, hybrid, personal
  - Community: Allows anyone to control the emulator with messages
  - Hybrid: Allows anyone to control the emulator with messages, you can control with reactions
  - Personal: Only you can control the emulator
- Controlling through reactions or through messages

# Installation
It requires some npm packages
- discord.js v12 (latest)
- canvas (node-canvas) (latest)
- gifencoder (latest)
- request (latest)
It also requires the package https://github.com/rauchg/gameboy, installation instructions are there, but you'll need to download the source code instead of npm'ing the link  
Note: there is a problem with installing canvas when installing the gameboy package. You'll need to modify the package.json that npm downloaded and change the canvas version number from 1.1.3 to 2.6.1 (which currently is latest)
Also another problem is that it sometimes says `this.opts.overrideMbc is not defined`. In order to fix this, you'll need to replace every instance of `this.opts.overrideMbc` in `index.js` from the gameboy package **except** the first one (where it says: `this.opts.overrideMbc = !!opts.overrideMbc;`, don't replace this one) with `false`. It's false by default, and you don't need to change it to true, and this bot doesn't require that it be true. You could probably remove the `!!` to make it work, but replacing it also works and it's the way I got it to work fine. Make 3 folders inside your bot folder. `games`, `saves`, `img`. If you don't it'll spit out errors about a non-existant directory. If it still does that even if you make the folders, you could try and adding a `./` before every time the directory is accessed in the code. 
If you don't want to do the installation, I've provided a release that has all the node_modules and the folders ready for use. But if you don't trust me, I'd recommend installing yourself. 

In order to get up and running, you'll need create a discord bot, and get the token. Edit the `gameboy.js` file and where it says `bot.login("your token here");` on line 8, just put your discord token inside the quotes.  
You can then fire up the bot with `node gameboy.js`, but I'd recommend using pm2 just in case it does crash (very rare).  
Then get the list of commands and controls with `gameboy help` in a discord chat  
Also make sure that the bot is an admin when invited, it still doesn't have checking when it checks for channels if it can post there.   

# Extra
Yes this bot's code isn't perfect, there is some repeated code that I could clean up, but it works fine.  
There is **no** sound. The audio data that the emulator spits out uses a different library that just doesn't work with node.js and only works with browsers and flash. It also uses float32 arrays and not buffers, so you'd need to rewrite a lot of the sound code to make it work. Also in game saves don't work, cause SRAM saving doesn't work yet, but save states exist so it's not a big problem. 

![The bot after it's initialized, in Personal mode](https://cdn.discordapp.com/attachments/439588116337000488/745420790530572288/unknown.png)  
The bot after it's initialized, in Personal mode

# Thanks to
- rauchg, which made the gameboy package work with node.js, without that package, this bot would never exist
- the testers that made this bot have better error checking, a lot more crashes would exist without them.
