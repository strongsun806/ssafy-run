import { Scene } from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const { width, height } = this.scale;

        // Dark tech gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x1e1b4b, 0x1e1b4b, 1);
        bg.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, height / 2 - 90, 'SSAFY RUN', {
            fontFamily: 'Arial Black',
            fontSize: '54px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 35, '멀캠으로 출근 준비 중...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Progress bar container
        const barWidth = 460;
        const barHeight = 24;
        const barX = (width - barWidth) / 2;
        const barY = height / 2 + 30;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x0f172a, 0.8);
        barBg.lineStyle(2, 0x38bdf8, 0.8);
        barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
        barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 6);

        const barFill = this.add.graphics();

        this.load.on('progress', (progress: number) => {
            barFill.clear();
            barFill.fillStyle(0x38bdf8, 1);
            if (progress > 0) {
                barFill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * progress, barHeight - 4, 4);
            }
        });
    }

    preload() {
        this.load.setPath('assets');
        // Any extra assets can be loaded here if needed
    }

    create() {
        // Procedurally generate all in-game pixel & vector textures
        TextureGenerator.generateAll(this);

        // Fade transition to MainMenu
        this.cameras.main.fade(300, 10, 14, 26);
        this.time.delayedCall(300, () => {
            this.scene.start('MainMenu');
        });
    }
}
