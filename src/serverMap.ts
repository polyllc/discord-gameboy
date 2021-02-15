import ServerEmulator from './serverEmulator'

class ServerMap {
    private games: Map<string, ServerEmulator>

    constructor() {
        this.games = new Map<string, ServerEmulator>()
    }

    public createEmulator(id: string, emulator: ServerEmulator) {
        this.games.set(id, emulator)
        return emulator
    }

    public getEmulator(id: string) {
        return this.games.get(id)
    }

    public destroyEmulator(id: string) {
        const serverEmulator = this.games.get(id)
        serverEmulator?.destroy()
        return this.games.delete(id)
    }
}


// export an instance of the class because we only need one instance of this
const serverMap = new ServerMap()
export default serverMap
