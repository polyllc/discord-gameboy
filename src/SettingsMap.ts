
class SettingsMap {
    private settings: Map<string, string>

    constructor() {
		this.settings = new Map<string, string>()
		this.settings['loop gifs'] = 'true'
    }

    public set(key: string, value: string) {
		this.settings[key] = value;
    }

    public get(id: string) {
        return this.settings.get(id)
    }

    public list() : string{
      let result : string = '';
      Object.keys(this.settings).forEach(key =>{
        result += key + ': ' + this.settings[key] + '\n';
      })
      return result
    }
}

const settingsMap = new SettingsMap()
export default settingsMap
