class SettingsMap {
    private settings: Map<string, Map<string, string>>

    constructor() {
        this.settings = new Map<string, Map<string, string>>()
    }

    public get(guildId: string, setting: string) : string {
		return this.settings.get(guildId)?.get(setting) ?? ""
	}

	public initGuildSettings(guildId : string){
		this.settings.set(guildId, new Map<string, string>());
		this.settings.get(guildId)?.set('loop_gifs', 'true');
	}

	public hasGuildSettings(guildId : string) : boolean{
		return this.settings.has(guildId)
	}

	public set(guildId : string, setting: string, value: string) : boolean{
		if (!this.settings.get(guildId)?.get(setting)){
			return false;
		} 
		this.settings.get(guildId)?.set(setting, value);
		return true;
	}

    public list(guildId: string){
		const guildSettings = this.settings.get(guildId) ?? new Map<string, string>()
		return Array.from(guildSettings.keys()).map(key=>{
			return `${key}: ${guildSettings.get(key)}`
		}).join('\n')
	}
}

const settingsMap = new SettingsMap()
export default settingsMap
