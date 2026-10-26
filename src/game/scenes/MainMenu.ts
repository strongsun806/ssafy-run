import { Scene } from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager, LeaderboardEntry } from '../utils/ScoreManager';

export class MainMenu extends Scene {
    private audioManager: AudioManager;
    private soundBtnText!: Phaser.GameObjects.Text;
    private modalContainer?: Phaser.GameObjects.Container;
    private liveRankContainer?: Phaser.GameObjects.Container;

    constructor() {
        super('MainMenu');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400, 10, 14, 26);

        // 1. Cyber City Background (Soft, calm navy-indigo)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x171e38, 0x241b3e, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_skyline_far')) {
            this.add.image(width / 2, height - 260, 'bg_skyline_far').setAlpha(0.45);
        }
        if (this.textures.exists('bg_skyline_near')) {
            this.add.image(width / 2, height - 170, 'bg_skyline_near').setAlpha(0.65);
        }

        // Ground
        for (let x = 0; x < width + 128; x += 128) {
            this.add.image(x, height - 30, 'ground_tex').setOrigin(0, 0.5);
        }

        // 2. Trainee Runner Animation on Ground
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
        const runner = this.add.sprite(280, height - 55, 'player_run_1')
            .setOrigin(0.5, 1)
            .setScale(1.3);
        runner.play('menu_run');

        // 3. Left Section: Title & Controls & Start
        const leftX = 360;

        const title = this.add.text(leftX, 130, 'SSAFY RUN', {
            fontFamily: 'Arial Black',
            fontSize: '66px',
            color: '#38bdf8',
            stroke: '#0369a1',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 6, color: '#0284c7', blur: 14, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 125,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(leftX, 195, '⏰ 지각 위기! 9시 입실 전까지 멀캠을 향해 질주하라!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        // My High Score Badge
        const highScore = ScoreManager.getHighScore();
        const scoreBadge = this.add.container(leftX, 245);
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0x0f172a, 0.85);
        badgeBg.lineStyle(2, 0xeab308);
        badgeBg.fillRoundedRect(-140, -18, 280, 36, 18);
        badgeBg.strokeRoundedRect(-140, -18, 280, 36, 18);
        scoreBadge.add(badgeBg);

        const scoreText = this.add.text(0, 0, `👑 내 최고 기록: ${highScore.toLocaleString()} 점`, {
            fontFamily: 'Arial Black',
            fontSize: '17px',
            color: '#facc15'
        }).setOrigin(0.5);
        scoreBadge.add(scoreText);

        // Start Game Button
        this.createButton(leftX, 325, '▶ 게임 시작 (START)', 0x2563eb, 0x1d4ed8, () => {
            this.startGame();
        }, 280, 56, '24px');

        // How to Play Button
        this.createButton(leftX, 400, '📖 게임 조작 & 아이템 팁', 0x334155, 0x475569, () => {
            this.showHowToPlayModal();
        }, 240, 44, '16px');

        const prompt = this.add.text(leftX, 460, '[Space] 키나 화면 터치로 즉시 시작', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 4. Right Section: Prominent LIVE Leaderboard Widget (명예의 전당)
        this.createLiveLeaderboardWidget(width - 360, 110);

        // 5. Sound Toggle (Top Right)
        this.createSoundToggle(width - 90, 45);

        // Keyboard listeners
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-SPACE', () => {
                if (!this.modalContainer) this.startGame();
            });
            this.input.keyboard.on('keydown-ENTER', () => {
                if (!this.modalContainer) this.startGame();
            });
        }
    }

    // Prominent on-screen live leaderboard
    private async createLiveLeaderboardWidget(x: number, y: number) {
        const boardW = 380;
        const boardH = 430;

        this.liveRankContainer = this.add.container(x - boardW / 2, y);

        // Panel Background with glowing cyan/gold border
        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.95);
        bg.lineStyle(2.5, 0x38bdf8, 0.9);
        bg.fillRoundedRect(0, 0, boardW, boardH, 16);
        bg.strokeRoundedRect(0, 0, boardW, boardH, 16);
        this.liveRankContainer.add(bg);

        // Header
        const header = this.add.text(boardW / 2, 32, '🏆 전국 명예의 전당', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#facc15'
        }).setOrigin(0.5);

        const subheader = this.add.text(boardW / 2, 58, '📡 실시간 동기화 중...', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        this.liveRankContainer.add([header, subheader]);

        // Fetch live leaderboard
        const result = await ScoreManager.fetchLeaderboard();
        subheader.setText(result.isOnline ? '🟢 실시간 온라인 동기화됨' : '🟡 로컬 랭킹 모드');
        subheader.setColor(result.isOnline ? '#4ade80' : '#facc15');

        const list = result.list.slice(0, 5);
        list.forEach((item, idx) => {
            const rowY = 85 + idx * 56;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `  ${idx + 1}.`;

            // Row Card
            const rowBg = this.add.graphics();
            rowBg.fillStyle(idx === 0 ? 0x854d0e : 0x1e293b, idx === 0 ? 0.75 : 0.6);
            rowBg.lineStyle(1, idx === 0 ? 0xfacc15 : 0x334155, 0.8);
            rowBg.fillRoundedRect(16, rowY, boardW - 32, 48, 8);
            rowBg.strokeRoundedRect(16, rowY, boardW - 32, 48, 8);
            this.liveRankContainer!.add(rowBg);

            // Name
            const nameText = this.add.text(28, rowY + 24, `${rankEmoji} ${item.name}`, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: idx === 0 ? '#fef08a' : '#ffffff'
            }).setOrigin(0, 0.5);

            // Score & Distance
            const scoreText = this.add.text(boardW - 28, rowY + 16, `${item.score.toLocaleString()}점`, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            const distText = this.add.text(boardW - 28, rowY + 34, `${item.distance}m (${item.date})`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#94a3b8'
            }).setOrigin(1, 0.5);

            this.liveRankContainer!.add([nameText, scoreText, distText]);
        });

        // View All / Refresh Button at bottom
        const fullBtn = this.createButton(boardW / 2, boardH - 30, '🔍 전체 랭킹 (TOP 10)', 0x1e293b, 0x334155, () => {
            this.showLeaderboardModal();
        }, 220, 34, '13px');
        this.liveRankContainer.add(fullBtn);
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
            container.setScale(1.03);
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
        bg.fillStyle(0x0f172a, 0.85);
        bg.lineStyle(1.5, 0x475569);
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

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.8);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.modalContainer.add(dim);

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

        const title = this.add.text(width / 2, py + 45, '📖 SSAFY RUN 가이드 & 조작법', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const guides = [
            '🎮 [조작법]',
            '• 점프 / 2단 점프: Space 또는 ↑ / W 키 (모바일: 화면 우측 터치 또는 JUMP)',
            '• 슬라이드 / 급강하: ↓ 또는 S 키 (모바일: 화면 좌측 터치 또는 SLIDE)',
            '  * 공중에서 슬라이드를 누르면 즉시 바닥으로 급강하(Fast Fall)합니다!',
            '',
            '🧩 [아이템 자동 자석 흡입 & 팁]',
            '• 🌱 커밋 잔디: +100점 (플레이어 근처로 오면 자석처럼 자동 흡입!)',
            '• 📱 입실 QR 코드: +300점 (높은 점프 구간의 최고 보너스)',
            '• ☕ 아이스 아메리카노: 멘탈 HP +25 즉시 회복',
            '• ⚡ 레드불 부스터: 5.5초간 골든 피버 대쉬 (자석 범위 2배 & 장애물 파괴)',
            '',
            '⚠️ [장애물 회피법]',
            '• ❌ 500 에러 모니터 / 버그 로봇: 완만한 잔디 곡선을 따라 1단 점프로 통과',
            '• 🚧 머지 컨플릭트 배너: 바닥 잔디 라인을 따라 슬라이드로 통과'
        ];

        const content = this.add.text(px + 40, py + 95, guides.join('\n'), {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#e2e8f0',
            lineSpacing: 5
        });
        this.modalContainer.add(content);

        const closeBtn = this.createButton(width / 2, py + panelH - 45, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
        }, 160, 40, '16px');
        this.modalContainer.add(closeBtn);
    }

    private async showLeaderboardModal() {
        if (this.modalContainer) return;
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(100);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.8);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.modalContainer.add(dim);

        const panelW = 740;
        const panelH = 550;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0xfacc15);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add(panel);

        const title = this.add.text(width / 2, py + 40, '🏆 전국 명예의 전당 (TOP 10)', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#facc15'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const loadingText = this.add.text(width / 2, py + 240, '📡 실시간 랭킹 동기화 중...', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.modalContainer.add(loadingText);

        const result = await ScoreManager.fetchLeaderboard();
        loadingText.destroy();

        const list = result.list;
        const maxDisplay = Math.min(8, list.length);
        list.slice(0, maxDisplay).forEach((item, idx) => {
            const rowY = py + 85 + idx * 46;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `  ${idx + 1}.`;

            const rowBg = this.add.graphics();
            rowBg.fillStyle(idx === 0 ? 0x854d0e : 0x1e293b, idx < 3 ? 0.8 : 0.5);
            rowBg.lineStyle(1.5, idx === 0 ? 0xfacc15 : 0x334155, 0.9);
            rowBg.fillRoundedRect(px + 30, rowY - 16, panelW - 60, 40, 8);
            rowBg.strokeRoundedRect(px + 30, rowY - 16, panelW - 60, 40, 8);
            this.modalContainer!.add(rowBg);

            const rowText = this.add.text(px + 45, rowY + 4, `${rankEmoji}  ${item.name}`, {
                fontFamily: 'Arial Black',
                fontSize: '17px',
                color: idx === 0 ? '#fef08a' : '#ffffff'
            }).setOrigin(0, 0.5);

            const statsText = this.add.text(px + panelW - 45, rowY + 4, `${item.score.toLocaleString()}점  (${item.distance}m / ${item.date})`, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            this.modalContainer!.add([rowText, statsText]);
        });

        const closeBtn = this.createButton(width / 2, py + panelH - 38, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
        }, 160, 40, '16px');
        this.modalContainer.add(closeBtn);
    }
}
