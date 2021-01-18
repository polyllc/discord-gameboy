import ServerEmulator from './serverEmulator'


class ServerMap {
    private games: Map<number, ServerEmulator>

    constructor() {
        this.games = new Map<number, ServerEmulator>()
    }

    public createEmulator(id: number, emulator: ServerEmulator) {
        this.games.set(id, emulator)
        return emulator
    }

    public getEmulator(id: number) {
        return this.games.get(id)
    }

    public destroyEmulator(id: number) {
        return this.games.delete(id)
    }
}


// export an instance of the class because we only need one instance of this
const serverMap = new ServerMap()
export default serverMap
