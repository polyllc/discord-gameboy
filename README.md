# Discord GameBoy

Discord bot that functions as a GameBoy Color emulator.

Supported features:

- Unique save states
- Multiple emulators in one instance of a bot, one per guild
- Use any ROM (GameBoy and GameBoy Color)
- GIFs as output
- Controls through discord messages
- Multiple output settings

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You need to have the latest version of node and npm to run this project.

```sh
npm install npm@latest -g
```

### Installation

1. Clone the repo

```sh
git clone https://github.com/paulohgodinho/discord-gameboy.git
```

2. Install NPM packages

```sh
cd discord-gameboy
npm install
```

3. Create a `.env` file in the root directory of the project and fill it in this format

```env
DISCORD_TOKEN=xxx         # the token for the discord bot
PRIVATE_HOST_CHANNEL=xxx  # the channel id for the edit mode (The bot must be invited to the server containing this channel)
```

## Usage

You can run the project in development mode using

```sh
npm run dev
```

To build the project for production

```sh
npm run build
```

To run the production build

```sh
npm run start
```

## Roadmap

See the [open issues](https://github.com/paulohgodinho/discord-gameboy) for a list of proposed features (and known issues).

## Contributing

Any contributions you make are ** greatly appreciated **.

1. Fork the Project
2. Create your Feature Branch(`git checkout -b feature/AmazingFeature`)
3. Commit your Changes(`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch(`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the GNU GENERAL PUBLIC LICENSE License. See`LICENSE` for more information.

## Acknowledgements

- [polyllc](https://github.com/polyllc) - The original author of the project
- [ardean](https://github.com/ardean) - Author of the great [jsGBC](https://github.com/ardean/jsGBC) library, without it this project wouldn't be possible
- The open source community
