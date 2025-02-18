// sounds.js
class SoundManager {
    constructor() {
        this.sounds = loadedAssets.sounds;
        this.muted = false;
        this.bgMusic = this.sounds.background;
        this.bgMusic.loop = true;
    }

    playSound(name, volume = 1) {
        if (this.muted) return;
        const sound = this.sounds[name];
        sound.volume = volume;
        sound.currentTime = 0;
        sound.play();
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.bgMusic.pause();
        } else {
            this.bgMusic.play();
        }
        return this.muted;
    }

    startBgMusic() {
        if (!this.muted) {
            this.bgMusic.play();
        }
    }
}

const soundManager = new SoundManager();
