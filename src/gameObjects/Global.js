export default class Global {
    static INSTANCE = new Global

    constructor() {
        this.values = {}
        this.isReload = false

        return Global.INSTANCE
    }

    load(key = '') {
        if(!key) return false
        this.key = key

        let item = localStorage.getItem(key)
        if(!item) return false

        let data = JSON.parse(item)

        for (const key in data) {
            const value = data[key]
            this.set(key, value)
        }

        return true
    }

    initReloadEvent() {
        this.isReload = true
        addEventListener('beforeunload', e => {
            e.preventDefault()
            this.save()
        })
    }

    set(key, value) {
        if(!key) return false

        this.values[key] = value
        if(!this.isReload) this.save()

        return true
    }

    get(key, defaultValue = null) {
        if(!key) return defaultValue
        
        if(this.values[key]) 
            return this.values[key]
        else 
            return defaultValue
    }

    save() {
        if(!this.key) return false

        localStorage.setItem(this.key, JSON.stringify(this.values))
        return true
    }
}