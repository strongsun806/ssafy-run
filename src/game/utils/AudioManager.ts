export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;
    private bgmInterval: number | null = null;
    private isBgmPlaying: boolean = false;

    private constructor() {
        const savedMute = localStorage.getItem('ssafy_run_muted');
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public getIsMuted(): boolean {
        return this.isMuted;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        localStorage.setItem('ssafy_run_muted', String(this.isMuted));
        if (this.isMuted) {
            this.stopBgm();
        } else {
            this.startBgm();
        }
        return this.isMuted;
    }

    public playJump() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    public playDoubleJump() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    public playSlide() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    public playJelly() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(659, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.05); // A5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    public playQr() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const now = this.ctx!.currentTime + idx * 0.04;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        });
    }

    public playCoffee() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const now = this.ctx!.currentTime + idx * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        });
    }

    public playHit() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    public playFever() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const now = this.ctx!.currentTime + idx * 0.06;

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        });
    }

    public playGameOver() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [440, 415.3, 392, 349.23];
        notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const now = this.ctx!.currentTime + idx * 0.16;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        });
    }

    public startBgm() {
        if (this.isMuted || this.isBgmPlaying) return;
        this.initContext();
        if (!this.ctx) return;

        this.isBgmPlaying = true;
        let step = 0;

        // Catchy retro bassline & arpeggio progression (A minor synth groove)
        const bassNotes = [
            220, 0, 220, 220, 261.63, 0, 293.66, 0,
            220, 0, 220, 220, 196, 0, 164.81, 0,
            220, 0, 220, 220, 261.63, 0, 293.66, 0,
            329.63, 0, 293.66, 0, 261.63, 0, 246.94, 0
        ];

        const tempoMs = 135; // ~110 BPM 16th notes
        this.bgmInterval = window.setInterval(() => {
            if (!this.ctx || this.isMuted || !this.isBgmPlaying) return;

            const noteFreq = bassNotes[step % bassNotes.length];
            const now = this.ctx.currentTime;

            if (noteFreq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(noteFreq, now);

                gain.gain.setValueAtTime(0.045, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.11);
            }

            // Light hi-hat beat on alternating steps
            if (step % 2 === 0) {
                const oscH = this.ctx.createOscillator();
                const gainH = this.ctx.createGain();
                oscH.type = 'sawtooth';
                oscH.frequency.setValueAtTime(step % 4 === 2 ? 8000 : 4000, now);
                gainH.gain.setValueAtTime(0.012, now);
                gainH.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                oscH.connect(gainH);
                gainH.connect(this.ctx.destination);
                oscH.start(now);
                oscH.stop(now + 0.04);
            }

            step++;
        }, tempoMs);
    }

    public stopBgm() {
        this.isBgmPlaying = false;
        if (this.bgmInterval !== null) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}
