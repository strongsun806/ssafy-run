import { Scene } from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager } from '../utils/ScoreManager';

export class MainMenu extends Scene {
    private audioManager: AudioManager;
    private soundBtnText!: Phaser.GameObjects.Text;
    private modalContainer?: Phaser.GameObjects.Container;

    constructor() {
        super('MainMenu');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400, 10, 14, 26);

        // 1. Cyber City Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x1e1b4b, 0x311042, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_skyline_far')) {
            this.add.image(width / 2, height - 260, 'bg_skyline_far').setAlpha(0.6);
        }
        if (this.textures.exists('bg_skyline_near')) {
            this.add.image(width / 2, height - 170, 'bg_skyline_near').setAlpha(0.85);
        }

        // Road / Ground on bottom
        for (let x = 0; x < width + 128; x += 128) {
            this.add.image(x, height - 30, 'ground_tex').setOrigin(0, 0.5);
        }

        // 2. Animated Running Trainee Preview
        if (!this.anims.exists('menu_run')) {
            this.anims.create({
                key: 'menu_run',
                frames: [
                    { key: 'player_run_1' },
                    { key: 'player_run_2' },
                    { key: 'player_run_3' },
                    { key: 'player_run_4' }
                ],
                frameRate: 10,
                repeat: -1
            });
        }
        const runner = this.add.sprite(width / 2, height - 60, 'player_run_1')
            .setOrigin(0.5, 1)
            .setScale(1.2);
        runner.play('menu_run');

        // 3. SSAFY RUN Title Header
        const title = this.add.text(width / 2, 140, 'SSAFY RUN', {
            fontFamily: 'Arial Black',
            fontSize: '68px',
            color: '#38bdf8',
            stroke: '#0369a1',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 6, color: '#0284c7', blur: 14, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 135,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(width / 2, 205, '⏰ 지각 위기! 9시 입실 전까지 멀캠을 향해 질주하라!', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        // High Score Badge
        const highScore = ScoreManager.getHighScore();
        const scoreBadge = this.add.container(width / 2, 255);
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0x0f172a, 0.85);
        badgeBg.lineStyle(2, 0xeab308);
        badgeBg.fillRoundedRect(-140, -18, 280, 36, 18);
        badgeBg.strokeRoundedRect(-140, -18, 280, 36, 18);
        scoreBadge.add(badgeBg);

        const scoreText = this.add.text(0, 0, `👑 최고 기록: ${highScore.toLocaleString()} 점`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#facc15'
        }).setOrigin(0.5);
        scoreBadge.add(scoreText);

        // 4. Action Buttons
        // Start Game Button
        const startBtn = this.createButton(width / 2, 335, '▶ 게임 시작 (START)', 0x2563eb, 0x1d4ed8, () => {
            this.startGame();
        }, 280, 56, '24px');

        // How to Play Button
        this.createButton(width / 2 - 140, 415, '📖 조작 & 규칙', 0x334155, 0x475569, () => {
            this.showHowToPlayModal();
        }, 160, 44, '16px');

        // Leaderboard Button
        this.createButton(width / 2 + 140, 415, '🏆 명예의 전당', 0x334155, 0x475569, () => {
            this.showLeaderboardModal();
        }, 160, 44, '16px');

        // Sound Toggle Button (Top Right)
        this.createSoundToggle(width - 90, 45);

        // Press Space / Tap anywhere prompt
        const prompt = this.add.text(width / 2, 480, '또는 [Space] 키나 화면 터치로 즉시 시작', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Global key & click listener for quick start
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-SPACE', () => {
                if (!this.modalContainer) this.startGame();
            });
            this.input.keyboard.on('keydown-ENTER', () => {
                if (!this.modalContainer) this.startGame();
            });
        }
    }

    private startGame() {
        this.audioManager.startBgm();
        this.cameras.main.fade(300, 10, 14, 26);
        this.time.delayedCall(300, () => {
            this.scene.start('Game');
        });
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        normalColor: number,
        hoverColor: number,
        onClick: () => void,
        w: number = 220,
        h: number = 48,
        fontSize: string = '18px'
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const drawBtn = (color: number) => {
            bg.clear();
            bg.fillStyle(color, 0.95);
            bg.lineStyle(2, 0x38bdf8, 0.8);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
        };
        drawBtn(normalColor);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            drawBtn(hoverColor);
            container.setScale(1.04);
        });

        container.on('pointerout', () => {
            drawBtn(normalColor);
            container.setScale(1.0);
        });

        container.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }

    private createSoundToggle(x: number, y: number) {
        const isMuted = this.audioManager.getIsMuted();
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.8);
        bg.lineStyle(1, 0x475569);
        bg.fillRoundedRect(-55, -20, 110, 40, 10);
        bg.strokeRoundedRect(-55, -20, 110, 40, 10);

        this.soundBtnText = this.add.text(0, 0, isMuted ? '🔇 MUTE' : '🔊 SOUND', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: isMuted ? '#ef4444' : '#22c55e'
        }).setOrigin(0.5);

        container.add([bg, this.soundBtnText]);
        container.setSize(110, 40);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerdown', () => {
            const nowMuted = this.audioManager.toggleMute();
            this.soundBtnText.setText(nowMuted ? '🔇 MUTE' : '🔊 SOUND');
            this.soundBtnText.setColor(nowMuted ? '#ef4444' : '#22c55e');
        });
    }

    private showHowToPlayModal() {
        if (this.modalContainer) return;
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(100);

        // Dark dim backdrop
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.75);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.modalContainer.add(dim);

        // Panel
        const panelW = 720;
        const panelH = 500;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0x38bdf8);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add(panel);

        // Modal Title
        const title = this.add.text(width / 2, py + 45, '📖 SSAFY RUN 가이드 & 조작법', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const guides = [
            '🎮 [조작법]',
            '• 점프 / 2단 점프: Space 또는 ↑ / W 키 (모바일: JUMP 버튼)',
            '• 슬라이드 (숙이기): ↓ 또는 S 키 길게 (모바일: SLIDE 버튼)',
            '',
            '🧩 [아이템 & 젤리]',
            '• 🌱 커밋 잔디: +100점 (연속 수집 시 콤보 증가 및 피버 모드 돌입!)',
            '• 📱 입실 QR 코드: +300점 (8시 59분 세이프 보너스)',
            '• ☕ 아이스 아메리카노: 멘탈 HP +25 회복 (초당 HP 자연 감소 방어)',
            '• ⚡ 레드불 에너지 드링크: 5초간 무적 & 골든 피버 대쉬!',
            '',
            '⚠️ [주의할 장애물]',
            '• ❌ 500 에러 모니터 / 버그 로봇: 점프로 뛰어넘기',
            '• 🚧 머지 컨플릭트 배너: 슬라이드로 밑으로 통과하기'
        ];

        const content = this.add.text(px + 40, py + 95, guides.join('\n'), {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#e2e8f0',
            lineSpacing: 5
        });
        this.modalContainer.add(content);

        // Close Button
        const closeBtn = this.createButton(width / 2, py + panelH - 45, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
        }, 160, 40, '16px');
        this.modalContainer.add(closeBtn);
    }

    private showLeaderboardModal() {
        if (this.modalContainer) return;
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(100);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.75);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.modalContainer.add(dim);

        const panelW = 680;
        const panelH = 460;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0xfacc15);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add(panel);

        const title = this.add.text(width / 2, py + 45, '🏆 명예의 전당 (TOP 5)', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#facc15'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const list = ScoreManager.getLeaderboard();
        list.forEach((item, idx) => {
            const rowY = py + 105 + idx * 52;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ` ${idx + 1}.`;

            // Row background
            const rowBg = this.add.graphics();
            rowBg.fillStyle(idx === 0 ? 0x854d0e : 0x1e293b, 0.6);
            rowBg.fillRoundedRect(px + 30, rowY - 18, panelW - 60, 44, 8);
            this.modalContainer!.add(rowBg);

            const rowText = this.add.text(px + 45, rowY, `${rankEmoji}  ${item.name}`, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: idx === 0 ? '#fef08a' : '#ffffff'
            }).setOrigin(0, 0.5);

            const statsText = this.add.text(px + panelW - 45, rowY, `${item.score.toLocaleString()}점  (${item.distance}m)`, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            this.modalContainer!.add([rowText, statsText]);
        });

        // Close Button
        const closeBtn = this.createButton(width / 2, py + panelH - 45, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
        }, 160, 40, '16px');
        this.modalContainer.add(closeBtn);
    }
}
