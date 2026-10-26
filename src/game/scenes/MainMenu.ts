import { Scene } from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager } from '../utils/ScoreManager';
import { SkinManager } from '../utils/SkinManager';

export class MainMenu extends Scene {
    private audioManager: AudioManager;
    private soundBtnText!: Phaser.GameObjects.Text;
    private modalContainer?: Phaser.GameObjects.Container;
    private liveRankContainer?: Phaser.GameObjects.Container;
    private runnerSprite?: Phaser.GameObjects.Sprite;
    private coinBadgeText?: Phaser.GameObjects.Text;

    constructor() {
        super('MainMenu');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400, 10, 14, 26);

        // 1. Cyber City Background (Stage 1 calm theme)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x171e38, 0x241b3e, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_s1_far')) {
            this.add.image(width / 2, height - 260, 'bg_s1_far').setAlpha(0.45);
        }
        if (this.textures.exists('bg_s1_near')) {
            this.add.image(width / 2, height - 170, 'bg_s1_near').setAlpha(0.65);
        }

        // Ground
        for (let x = 0; x < width + 128; x += 128) {
            this.add.image(x, height - 30, 'ground_s1').setOrigin(0, 0.5);
        }

        // 2. Trainee Runner Animation with Equipped Skin
        this.createOrUpdateRunner();

        // 3. Left Section: Title & Controls & Start
        const leftX = 360;

        const title = this.add.text(leftX, 120, 'SSAFY RUN', {
            fontFamily: 'Arial Black',
            fontSize: '66px',
            color: '#38bdf8',
            stroke: '#0369a1',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 6, color: '#0284c7', blur: 14, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 115,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(leftX, 185, '⏰ 지각 위기! 9시 입실 전까지 멀캠을 향해 질주하라!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        // My High Score & Coin Balance Badges
        const highScore = ScoreManager.getHighScore();
        const coins = SkinManager.getCoins();

        const badgeContainer = this.add.container(leftX, 235);
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0x0f172a, 0.85);
        badgeBg.lineStyle(2, 0xeab308);
        badgeBg.fillRoundedRect(-165, -18, 330, 36, 18);
        badgeBg.strokeRoundedRect(-165, -18, 330, 36, 18);
        badgeContainer.add(badgeBg);

        const scoreText = this.add.text(-35, 0, `👑 최고: ${highScore.toLocaleString()}점`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#facc15'
        }).setOrigin(0.5);

        this.coinBadgeText = this.add.text(90, 0, `🪙 ${coins}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#fde047'
        }).setOrigin(0.5);

        badgeContainer.add([scoreText, this.coinBadgeText]);

        // Start Game Button
        this.createButton(leftX, 310, '▶ 게임 시작 (START)', 0x2563eb, 0x1d4ed8, () => {
            this.startGame();
        }, 280, 56, '24px');

        // Shop / Dressing Room Button (🛍️ 캐릭터 꾸미기 상점!)
        this.createButton(leftX - 80, 385, '🛍️ 스킨 상점', 0x7c3aed, 0x6d28d9, () => {
            this.showShopModal();
        }, 130, 44, '15px');

        // How to Play Button
        this.createButton(leftX + 80, 385, '📖 조작 & 팁', 0x334155, 0x475569, () => {
            this.showHowToPlayModal();
        }, 130, 44, '15px');

        const prompt = this.add.text(leftX, 450, '[Space] 키나 화면 터치로 즉시 시작', {
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
        this.createLiveLeaderboardWidget(width - 360, 95);

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

    private createOrUpdateRunner() {
        const { height } = this.scale;
        const skinId = SkinManager.getEquippedSkin();
        const animKey = `menu_run_${skinId}`;

        if (!this.anims.exists(animKey)) {
            this.anims.create({
                key: animKey,
                frames: [
                    { key: `player_${skinId}_run_1` },
                    { key: `player_${skinId}_run_2` },
                    { key: `player_${skinId}_run_3` },
                    { key: `player_${skinId}_run_4` }
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        if (this.runnerSprite) {
            this.runnerSprite.play(animKey);
        } else {
            this.runnerSprite = this.add.sprite(280, height - 55, `player_${skinId}_run_1`)
                .setOrigin(0.5, 1)
                .setScale(1.3);
            this.runnerSprite.play(animKey);
        }
    }

    private async createLiveLeaderboardWidget(x: number, y: number) {
        const boardW = 380;
        const boardH = 450;

        this.liveRankContainer = this.add.container(x - boardW / 2, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.95);
        bg.lineStyle(2.5, 0x38bdf8, 0.9);
        bg.fillRoundedRect(0, 0, boardW, boardH, 16);
        bg.strokeRoundedRect(0, 0, boardW, boardH, 16);
        this.liveRankContainer.add(bg);

        const header = this.add.text(boardW / 2, 30, '🏆 전국 명예의 전당', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#facc15'
        }).setOrigin(0.5);

        const subheader = this.add.text(boardW / 2, 54, '📡 실시간 동기화 중...', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        this.liveRankContainer.add([header, subheader]);

        const result = await ScoreManager.fetchLeaderboard();
        subheader.setText(result.isOnline ? '🟢 Firebase 실시간 클라우드 연동됨' : '🟡 로컬 랭킹 모드');
        subheader.setColor(result.isOnline ? '#4ade80' : '#facc15');

        const list = result.list.slice(0, 5);
        list.forEach((item, idx) => {
            const rowY = 78 + idx * 58;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `  ${idx + 1}.`;

            const rowBg = this.add.graphics();
            rowBg.fillStyle(idx === 0 ? 0x854d0e : 0x1e293b, idx === 0 ? 0.75 : 0.6);
            rowBg.lineStyle(1, idx === 0 ? 0xfacc15 : 0x334155, 0.8);
            rowBg.fillRoundedRect(16, rowY, boardW - 32, 50, 8);
            rowBg.strokeRoundedRect(16, rowY, boardW - 32, 50, 8);
            this.liveRankContainer!.add(rowBg);

            const nameText = this.add.text(28, rowY + 25, `${rankEmoji} ${item.name}`, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: idx === 0 ? '#fef08a' : '#ffffff'
            }).setOrigin(0, 0.5);

            const scoreText = this.add.text(boardW - 28, rowY + 16, `${item.score.toLocaleString()}점`, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            const distText = this.add.text(boardW - 28, rowY + 36, `${item.distance}m (${item.date})`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#94a3b8'
            }).setOrigin(1, 0.5);

            this.liveRankContainer!.add([nameText, scoreText, distText]);
        });

        const fullBtn = this.createButton(boardW / 2, boardH - 28, '🔍 전체 랭킹 (TOP 10)', 0x1e293b, 0x334155, () => {
            this.showLeaderboardModal();
        }, 220, 34, '13px');
        this.liveRankContainer.add(fullBtn);
    }

    // Shop & Dressing Room Modal (스킨 꾸미기 상점)
    private showShopModal() {
        if (this.modalContainer) return;
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(100);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.8);
        dim.fillRect(0, 0, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.modalContainer.add(dim);

        const panelW = 820;
        const panelH = 560;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0xa855f7);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add(panel);

        // Header Title & Coins
        const title = this.add.text(width / 2, py + 38, '🛍️ 교육생 꾸미기 락커룸', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#c084fc'
        }).setOrigin(0.5);

        const myCoinsText = this.add.text(width / 2, py + 72, `내 보유 코인: 🪙 ${SkinManager.getCoins().toLocaleString()}`, {
            fontFamily: 'Arial Black',
            fontSize: '17px',
            color: '#facc15'
        }).setOrigin(0.5);

        this.modalContainer.add([title, myCoinsText]);

        // Render All 5 Skins
        const skins = SkinManager.SKINS;
        skins.forEach((skin, idx) => {
            const rowY = py + 105 + idx * 78;
            const isOwned = SkinManager.isOwned(skin.id);
            const isEquipped = SkinManager.getEquippedSkin() === skin.id;

            // Card Background
            const cardBg = this.add.graphics();
            cardBg.fillStyle(isEquipped ? 0x3b0764 : 0x1e293b, 0.85);
            cardBg.lineStyle(1.5, isEquipped ? 0xc084fc : 0x475569, 0.8);
            cardBg.fillRoundedRect(px + 30, rowY, panelW - 60, 68, 10);
            cardBg.strokeRoundedRect(px + 30, rowY, panelW - 60, 68, 10);
            this.modalContainer!.add(cardBg);

            // Sprite preview
            const previewSprite = this.add.sprite(px + 70, rowY + 34, `player_${skin.id}_run_1`)
                .setScale(0.85);
            this.modalContainer!.add(previewSprite);

            // Skin Name & Description
            const nameText = this.add.text(px + 120, rowY + 18, skin.name, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: skin.color
            });

            const descText = this.add.text(px + 120, rowY + 42, skin.description, {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#94a3b8'
            });
            this.modalContainer!.add([nameText, descText]);

            // Action Button: [장착 중] or [장착하기] or [🪙 가격 구매]
            if (isEquipped) {
                const eqBadge = this.add.text(px + panelW - 100, rowY + 34, '✔ 장착 중', {
                    fontFamily: 'Arial Black',
                    fontSize: '16px',
                    color: '#4ade80'
                }).setOrigin(0.5);
                this.modalContainer!.add(eqBadge);
            } else if (isOwned) {
                const equipBtn = this.createButton(px + panelW - 100, rowY + 34, '장착하기', 0x2563eb, 0x1d4ed8, () => {
                    SkinManager.equipSkin(skin.id);
                    this.audioManager.playJump();
                    this.modalContainer?.destroy();
                    this.modalContainer = undefined;
                    this.createOrUpdateRunner();
                    this.showShopModal(); // Refresh modal
                }, 110, 36, '14px');
                this.modalContainer!.add(equipBtn);
            } else {
                const buyBtn = this.createButton(px + panelW - 100, rowY + 34, `🪙 ${skin.price}`, 0x059669, 0x047857, () => {
                    if (SkinManager.buySkin(skin.id)) {
                        this.audioManager.playCoin();
                        this.coinBadgeText?.setText(`🪙 ${SkinManager.getCoins()}`);
                        this.modalContainer?.destroy();
                        this.modalContainer = undefined;
                        this.createOrUpdateRunner();
                        this.showShopModal();
                    } else {
                        alert('코인이 부족합니다! 게임을 플레이하여 코인을 모아보세요.');
                    }
                }, 110, 36, '14px');
                this.modalContainer!.add(buyBtn);
            }
        });

        // Close Button
        const closeBtn = this.createButton(width / 2, py + panelH - 30, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
            this.coinBadgeText?.setText(`🪙 ${SkinManager.getCoins()}`);
        }, 150, 38, '15px');
        this.modalContainer.add(closeBtn);
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

        const panelW = 740;
        const panelH = 520;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0x38bdf8);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add(panel);

        const title = this.add.text(width / 2, py + 42, '📖 SSAFY RUN 쿠키런 모드 가이드', {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const guides = [
            '🎮 [조작법]',
            '• 점프 / 2단 점프: Space 또는 ↑ / W 키 (모바일: 화면 우측 터치 또는 JUMP)',
            '• 슬라이드 / 급강하: ↓ 또는 S 키 (모바일: 화면 좌측 터치 또는 SLIDE)',
            '',
            '⚠️ [구덩이 & 2층 공중 발판]',
            '• 바닥 구덩이(GAP) 추락 시 30 HP 피해를 입고 드론이 구출합니다!',
            '• 공중 발판으로 도약하면 지상 장애물을 피하고 대량의 코인을 획득할 수 있습니다.',
            '',
            '🗺️ [다양한 단계의 맵]',
            '• STAGE 1: 테헤란로 출근길 (0~500m)',
            '• STAGE 2: 비상계단 & 엘리베이터 지옥 (500~1100m)',
            '• STAGE 3: 11층 미래 코딩 랩실 (1100m+)',
            '',
            '🧩 [아이템 & 꾸미기]',
            '• 🧲 자석 아이템: 6.5초간 화면의 모든 코인과 잔디를 강력하게 자동 흡입!',
            '• 🪙 골드 코인: 모아서 메인 메뉴의 [🛍️ 스킨 상점]에서 멋진 스킨을 구매하세요!'
        ];

        const content = this.add.text(px + 40, py + 88, guides.join('\n'), {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#e2e8f0',
            lineSpacing: 5
        });
        this.modalContainer.add(content);

        const closeBtn = this.createButton(width / 2, py + panelH - 35, '닫기 (CLOSE)', 0x2563eb, 0x1d4ed8, () => {
            this.modalContainer?.destroy();
            this.modalContainer = undefined;
        }, 160, 38, '15px');
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
