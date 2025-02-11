export class NADC338 {
    constructor(ip, port = 30001) {
        this.ip = ip;
        this.port = port;
        this.powerState = null;
        this.volume = 0;
        this.source = null;
        this.mute = null;
        this.brightness = null;
        this.bassEqualization = null;
        this.autoSense = null;
        this.autoStandby = null;
    }

    async sendCmd(cmd, readReply = false) {
        try {
            const response = await fetch(`http://localhost:30001/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ip: this.ip, port: this.port, cmd})
            });
            if (readReply) {
                const text = await response.text();
                if (text.includes('='))
                    return text.split('=')[1].trim();
                return text.trim();
            }
            return null;
        } catch (error) {
            console.error('Error sending command:', error);
            throw error;
        }
    }

    async powerOn() {
        await this.sendCmd('Main.Power=On', true);
        this.powerState = 'On';
    }

    async powerOff() {
        await this.sendCmd('Main.Power=Off', true);
        this.powerState = 'Off';
    }

    async setVolume(vol) {
        await this.sendCmd(`Main.Volume=${vol}`, true);
        this.volume = vol;
    }

    async setSource(source) {
        await this.sendCmd(`Main.Source=${source}`, true);
        this.source = source;
    }

    async setMute() {
        await this.sendCmd('Main.Mute=On', true);
        this.mute = 'On';
    }

    async unMute() {
        await this.sendCmd('Main.Mute=Off', true);
        this.mute = 'Off';
    }

    async setBrightness(level) {
        await this.sendCmd(`Main.Brightness=${level}`, true);
        this.brightness = level;
    }

    async setBass() {
        await this.sendCmd('Main.Bass=On', true);
        this.bassEqualization = 'On';
    }

    async unsetBass() {
        await this.sendCmd('Main.Bass=Off', true);
        this.bassEqualization = 'Off';
    }

    async setAutoSense() {
        await this.sendCmd('Main.AutoSense=On', true);
        this.autoSense = 'On';
    }

    async unsetAutoSense() {
        await this.sendCmd('Main.AutoSense=Off', true);
        this.autoSense = 'Off';
    }

    async setAutoStandby() {
        await this.sendCmd('Main.AutoStandby=On', true);
        this.autoStandby = 'On';
    }

    async unsetAutoStandby() {
        await this.sendCmd('Main.AutoStandby=Off', true);
        this.autoStandby = 'Off';
    }

    async getPower() {
        return await this.sendCmd('Main.Power?', true);
    }

    async getVolume() {
        return await this.sendCmd('Main.Volume?', true);
    }

    async getSource() {
        return await this.sendCmd('Main.Source?', true);
    }

    async getMute() {
        return await this.sendCmd('Main.Mute?', true);
    }

    async getBrightness() {
        return await this.sendCmd('Main.Brightness?', true);
    }

    async getBass() {
        return await this.sendCmd('Main.Bass?', true);
    }

    async getAutoSense() {
        return await this.sendCmd('Main.AutoSense?', true);
    }

    async getAutoStandby() {
        return await this.sendCmd('Main.AutoStandby?', true);
    }
}