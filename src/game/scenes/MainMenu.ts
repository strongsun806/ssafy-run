import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager } from '../utils/ScoreManager';
import { SkinManager } from '../utils/SkinManager';
import { UpgradeManager } from '../utils/UpgradeManager';

export class MainMenu extends Scene {
    private audioManager: AudioManager;
    private soundBtnText!: Phaser.GameObjects.Text;
    private modalContainer?: Phaser.GameObjects.Container;
    private liveRankContainer?: Phaser.GameObjects.Container;
    private runnerSprite?: Phaser.GameObjects.Sprite;
    private coinBadgeText?: Phaser.GameObjects.Text;
    private popStateHandler?: () => void;

    constructor() {
        super('MainMenu');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.modalContainer = undefined;

        // 1. Calm Eye-Comfort Dark Slate Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0b1120, 0x0b1120, 0x111827, 0x111827, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_s1_far')) {
            this.add.image(width / 2, height - 260, 'bg_s1_far').setAlpha(0.25);
        }
        if (this.textures.exists('bg_s1_near')) {
            this.add.image(width / 2, height - 170, 'bg_s1_near').setAlpha(0.32);
        }

        // Ground
        for (let x = 0; x < width + 128; x += 128) {
            this.add.image(x, height - 30, 'ground_s1').setOrigin(0, 0.5);
        }

        // 2. Static Runner Character & Companion Drone (No bobbing or restless movement in lobby)
        this.createOrUpdateRunner();
        if (this.textures.exists('companion_drone')) {
            this.add.image(210, height - 125, 'companion_drone').setAlpha(0.75);
        }

        // 3. Left Section: Clean Static Title & Main Navigation
        const leftX = 360;

        this.add.text(leftX, 118, 'SSAFY RUN', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '64px',
            color: '#38bdf8',
            stroke: '#0f172a',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(leftX, 178, '9시 입실 마감 전까지 멀캠으로 돌파하라', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '19px',
            color: '#e2e8f0'
        }).setOrigin(0.5);

        // High Score & Coin Balance Pill
        const highScore = ScoreManager.getHighScore();
        const coins = SkinManager.getCoins();

        const badgeContainer = this.add.container(leftX, 232);
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0x0f172a, 0.9);
        badgeBg.lineStyle(1.5, 0x475569);
        badgeBg.fillRoundedRect(-165, -18, 330, 36, 18);
        badgeBg.strokeRoundedRect(-165, -18, 330, 36, 18);
        badgeContainer.add(badgeBg);

        const scoreText = this.add.text(-42, 0, `최고 기록: ${highScore.toLocaleString()}점`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        this.coinBadgeText = this.add.text(92, 0, `${coins.toLocaleString()} G`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#eab308'
        }).setOrigin(0.5);

        badgeContainer.add([scoreText, this.coinBadgeText]);

        // Main Mode Buttons
        this.createButton(leftX, 298, '스테이지 모드 (STAGE 1~30)', 0x059669, 0x047857, () => {
            this.scene.start('StageSelect');
        }, 312, 52, '19px');

        this.createButton(leftX, 362, '무한 랭킹 런 (INFINITE)', 0x2563eb, 0x1d4ed8, () => {
            this.startGame();
        }, 312, 52, '19px');

        // Sub Buttons: Spec Upgrade, Skin Shop, Guide
        this.createButton(leftX - 106, 426, '스펙 강화', 0x0891b2, 0x0e7490, () => {
            this.showTechLabModal();
        }, 98, 44, '15px');

        this.createButton(leftX, 426, '스킨 상점', 0x7c3aed, 0x6d28d9, () => {
            this.showShopModal();
        }, 98, 44, '15px');

        this.createButton(leftX + 106, 426, '게임 방법', 0x334155, 0x475569, () => {
            this.showHowToPlayModal();
        }, 98, 44, '15px');

        this.add.text(leftX, 482, '[Space] 무한 런 시작   ·   [Shift] 인게임 대시', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // 4. Right Section: Live Leaderboard Widget
        this.createLiveLeaderboardWidget(width - 360, 95);

        // 5. Sound Toggle (Top Right)
        this.createSoundToggle(width - 90, 45);

        // 6. Keyboard & Browser Back Listeners
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-SPACE', () => {
                if (!this.modalContainer) this.startGame();
            });
            this.input.keyboard.on('keydown-ENTER', () => {
                if (!this.modalContainer) this.startGame();
            });
            this.input.keyboard.on('keydown-ESC', () => {
                if (this.modalContainer) this.closeModal();
            });
            this.input.keyboard.on('keydown-BACKSPACE', () => {
                if (this.modalContainer) this.closeModal();
            });
        }

        this.popStateHandler = () => {
            if (this.modalContainer) {
                this.closeModal();
            }
        };
        window.addEventListener('popstate', this.popStateHandler);
        this.events.once('shutdown', () => {
            if (this.popStateHandler) {
                window.removeEventListener('popstate', this.popStateHandler);
            }
        });
    }

    private createOrUpdateRunner() {
        const { height } = this.scale;
        const skinId = SkinManager.getEquippedSkin();

        if (this.runnerSprite) {
            this.runnerSprite.setTexture(`player_${skinId}_run_1`);
        } else {
            this.runnerSprite = this.add.sprite(260, height - 55, `player_${skinId}_run_1`)
                .setOrigin(0.5, 1)
                .setScale(1.25);
        }
    }

    private async createLiveLeaderboardWidget(x: number, y: number) {
        const boardW = 380;
        const boardH = 450;

        this.liveRankContainer = this.add.container(x - boardW / 2, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.95);
        bg.lineStyle(2, 0x334155, 0.9);
        bg.fillRoundedRect(0, 0, boardW, boardH, 16);
        bg.strokeRoundedRect(0, 0, boardW, boardH, 16);
        this.liveRankContainer.add(bg);

        const header = this.add.text(boardW / 2, 30, '전국 명예의 전당', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '22px',
            color: '#e2e8f0'
        }).setOrigin(0.5);

        const subheader = this.add.text(boardW / 2, 54, '실시간 랭킹 동기화 중...', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.liveRankContainer.add([header, subheader]);

        const result = await ScoreManager.fetchLeaderboard();
        subheader.setText(result.isOnline ? 'Firebase 실시간 랭킹 연동됨' : '로컬 랭킹 모드');
        subheader.setColor(result.isOnline ? '#4ade80' : '#94a3b8');

        const list = result.list.slice(0, 5);
        list.forEach((item, idx) => {
            const rowY = 78 + idx * 58;
            const rankLabel = `${idx + 1}위.`;

            const rowBg = this.add.graphics();
            rowBg.fillStyle(0x1e293b, 0.7);
            rowBg.lineStyle(1, idx === 0 ? 0xeab308 : 0x334155, 0.8);
            rowBg.fillRoundedRect(16, rowY, boardW - 32, 50, 8);
            rowBg.strokeRoundedRect(16, rowY, boardW - 32, 50, 8);
            this.liveRankContainer!.add(rowBg);

            const stageBadge = item.stage ? `[ST.${item.stage}]` : '';
            const nameText = this.add.text(28, rowY + 16, `${rankLabel} ${item.name}`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '15px',
                color: idx === 0 ? '#fde047' : '#f8fafc'
            }).setOrigin(0, 0.5);

            const detailText = this.add.text(28, rowY + 36, `${stageBadge} ${item.distance}m (${item.date})`, {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '12px',
                color: '#94a3b8'
            }).setOrigin(0, 0.5);

            const scoreText = this.add.text(boardW - 28, rowY + 25, `${item.score.toLocaleString()}점`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '16px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            this.liveRankContainer!.add([nameText, detailText, scoreText]);
        });

        const fullBtn = this.createButton(boardW / 2, boardH - 28, '전체 랭킹 보기 (TOP 10)', 0x1e293b, 0x334155, () => {
            this.showLeaderboardModal();
        }, 220, 34, '13px');
        this.liveRankContainer.add(fullBtn);
    }

    private closeModal() {
        this.modalContainer?.destroy();
        this.modalContainer = undefined;
        this.coinBadgeText?.setText(`${SkinManager.getCoins().toLocaleString()} G`);
    }

    private showTechLabModal() {
        if (this.modalContainer) return;
        window.history.pushState({ modal: 'techlab' }, '');
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(500);

        const dim = this.add.zone(width / 2, height / 2, width, height).setOrigin(0.5).setInteractive();
        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.82);
        dimBg.fillRect(0, 0, width, height);
        dim.on('pointerdown', () => this.closeModal());
        this.modalContainer.add([dimBg, dim]);

        const panelW = 820;
        const panelH = 540;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panelBlocker = this.add.zone(width / 2, height / 2, panelW, panelH).setOrigin(0.5).setInteractive();
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(2, 0x38bdf8);
        panel.fillRoundedRect(px, py, panelW, panelH, 18);
        panel.strokeRoundedRect(px, py, panelW, panelH, 18);
        this.modalContainer.add([panelBlocker, panel]);

        const title = this.add.text(width / 2, py + 36, '스펙 강화 연구소 (TECH LAB)', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '26px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const subText = this.add.text(width / 2, py + 68, `보유 코인: ${SkinManager.getCoins().toLocaleString()} G   |   강화 능력치는 모든 스테이지에 영구 적용됩니다`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        this.modalContainer.add([title, subText]);

        const canClaim = UpgradeManager.canClaimDailySupply();
        const supplyBtn = this.createButton(
            width / 2,
            py + 110,
            canClaim ? '오늘의 무료 지원금 받기 (+600 G 즉시 지급)' : '오늘의 무료 지원금 수령 완료',
            canClaim ? 0x0284c7 : 0x334155,
            canClaim ? 0x0369a1 : 0x334155,
            () => {
                if (UpgradeManager.canClaimDailySupply()) {
                    UpgradeManager.claimDailySupply();
                    this.audioManager.playCoin();
                    this.closeModal();
                    this.showTechLabModal();
                }
            },
            400,
            36,
            '14px'
        );
        this.modalContainer.add(supplyBtn);

        const infos = UpgradeManager.getAllUpgradeInfos();
        infos.forEach((info, idx) => {
            const rowY = py + 148 + idx * 102;
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0x1e293b, 0.9);
            cardBg.lineStyle(1.5, 0x334155, 0.9);
            cardBg.fillRoundedRect(px + 34, rowY, panelW - 68, 88, 12);
            cardBg.strokeRoundedRect(px + 34, rowY, panelW - 68, 88, 12);
            this.modalContainer!.add(cardBg);

            const nameTxt = this.add.text(px + 54, rowY + 14, `${info.name}   [Lv.${info.level} / ${info.maxLevel}]`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '18px',
                color: '#f8fafc'
            });

            const stars = '★'.repeat(info.level) + '☆'.repeat(info.maxLevel - info.level);
            const starTxt = this.add.text(px + 54, rowY + 38, `강화 단계: ${stars}`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#eab308'
            });

            const descTxt = this.add.text(px + 54, rowY + 60, `${info.currentEffectText}  ▶  ${info.nextEffectText}`, {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '14px',
                color: '#cbd5e1'
            });

            this.modalContainer!.add([nameTxt, starTxt, descTxt]);

            if (info.level >= info.maxLevel) {
                const maxBadge = this.add.text(px + panelW - 115, rowY + 44, 'MAX 달성', {
                    fontFamily: 'Arial Black',
                    fontSize: '16px',
                    color: '#4ade80'
                }).setOrigin(0.5);
                this.modalContainer!.add(maxBadge);
            } else {
                const canAfford = SkinManager.getCoins() >= info.cost;
                const upBtn = this.createButton(
                    px + panelW - 115,
                    rowY + 44,
                    `강화 (${info.cost} G)`,
                    canAfford ? 0x0284c7 : 0x475569,
                    canAfford ? 0x0369a1 : 0x334155,
                    () => {
                        const res = UpgradeManager.upgradeStat(info.id);
                        if (res.success) {
                            this.audioManager.playStageClear();
                            this.closeModal();
                            this.showTechLabModal();
                        }
                    },
                    148,
                    40,
                    '14px'
                );
                this.modalContainer!.add(upBtn);
            }
        });

        const closeBtn = this.createButton(width / 2, py + panelH - 36, '◀ 메인 화면으로 돌아가기 (ESC)', 0x334155, 0x475569, () => {
            this.closeModal();
        }, 240, 42, '15px');
        this.modalContainer.add(closeBtn);
    }

    private showShopModal() {
        if (this.modalContainer) return;
        window.history.pushState({ modal: 'shop' }, '');
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(500);

        const dim = this.add.zone(width / 2, height / 2, width, height).setOrigin(0.5).setInteractive();
        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.82);
        dimBg.fillRect(0, 0, width, height);
        dim.on('pointerdown', () => this.closeModal());
        this.modalContainer.add([dimBg, dim]);

        const panelW = 820;
        const panelH = 560;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panelBlocker = this.add.zone(width / 2, height / 2, panelW, panelH).setOrigin(0.5).setInteractive();
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(2, 0x475569);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add([panelBlocker, panel]);

        const title = this.add.text(width / 2, py + 36, '캐릭터 스킨 상점', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '26px',
            color: '#f8fafc'
        }).setOrigin(0.5);

        const myCoinsText = this.add.text(width / 2, py + 68, `보유 코인: ${SkinManager.getCoins().toLocaleString()} G`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#eab308'
        }).setOrigin(0.5);

        this.modalContainer.add([title, myCoinsText]);

        const skins = SkinManager.SKINS;
        skins.forEach((skin, idx) => {
            const rowY = py + 100 + idx * 78;
            const isOwned = SkinManager.isOwned(skin.id);
            const isEquipped = SkinManager.getEquippedSkin() === skin.id;

            const cardBg = this.add.graphics();
            cardBg.fillStyle(0x1e293b, 0.85);
            cardBg.lineStyle(1.5, isEquipped ? 0x38bdf8 : 0x334155, 0.85);
            cardBg.fillRoundedRect(px + 30, rowY, panelW - 60, 68, 10);
            cardBg.strokeRoundedRect(px + 30, rowY, panelW - 60, 68, 10);
            this.modalContainer!.add(cardBg);

            const previewSprite = this.add.sprite(px + 70, rowY + 34, `player_${skin.id}_run_1`).setScale(0.85);
            this.modalContainer!.add(previewSprite);

            const nameText = this.add.text(px + 120, rowY + 16, skin.name, {
                fontFamily: '"Black Han Sans", sans-serif',
                fontSize: '18px',
                color: '#f8fafc'
            });

            const descText = this.add.text(px + 120, rowY + 42, skin.description, {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '14px',
                color: '#94a3b8'
            });
            this.modalContainer!.add([nameText, descText]);

            if (isEquipped) {
                const eqBadge = this.add.text(px + panelW - 100, rowY + 34, '장착 중', {
                    fontFamily: 'Arial Black',
                    fontSize: '15px',
                    color: '#4ade80'
                }).setOrigin(0.5);
                this.modalContainer!.add(eqBadge);
            } else if (isOwned) {
                const equipBtn = this.createButton(px + panelW - 100, rowY + 34, '장착하기', 0x2563eb, 0x1d4ed8, () => {
                    SkinManager.equipSkin(skin.id);
                    this.audioManager.playJump();
                    this.closeModal();
                    this.createOrUpdateRunner();
                    this.showShopModal();
                }, 110, 36, '14px');
                this.modalContainer!.add(equipBtn);
            } else {
                const buyBtn = this.createButton(px + panelW - 100, rowY + 34, `${skin.price} G 구매`, 0x059669, 0x047857, () => {
                    if (SkinManager.buySkin(skin.id)) {
                        this.audioManager.playCoin();
                        this.closeModal();
                        this.createOrUpdateRunner();
                        this.showShopModal();
                    } else {
                        alert('코인이 부족합니다! 스테이지를 플레이하거나 스펙 강화소에서 무료 지원금을 수령해보세요.');
                    }
                }, 115, 36, '14px');
                this.modalContainer!.add(buyBtn);
            }
        });

        const closeBtn = this.createButton(width / 2, py + panelH - 32, '◀ 메인 화면으로 돌아가기 (ESC)', 0x334155, 0x475569, () => {
            this.closeModal();
        }, 240, 40, '15px');
        this.modalContainer.add(closeBtn);
    }

    private startGame() {
        this.audioManager.startBgm();
        this.scene.start('Game', { mode: 'infinite' });
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
            bg.lineStyle(1.5, 0x475569, 0.9);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
        };
        drawBtn(normalColor);

        const label = this.add.text(0, 0, text, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);

        const maxTextWidth = w - 18;
        if (label.width > maxTextWidth) {
            label.setScale(maxTextWidth / label.width);
        }

        const hitZone = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        container.add([bg, label, hitZone]);

        hitZone.on('pointerover', () => {
            drawBtn(hoverColor);
        });

        hitZone.on('pointerout', () => {
            drawBtn(normalColor);
        });

        hitZone.on('pointerdown', () => {
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

        this.soundBtnText = this.add.text(0, 0, isMuted ? 'SOUND OFF' : 'SOUND ON', {
            fontFamily: 'Arial Black',
            fontSize: '13px',
            color: isMuted ? '#ef4444' : '#22c55e'
        }).setOrigin(0.5);

        const hitZone = this.add.zone(0, 0, 110, 40).setOrigin(0.5).setInteractive({ useHandCursor: true });
        container.add([bg, this.soundBtnText, hitZone]);

        hitZone.on('pointerdown', () => {
            const nowMuted = this.audioManager.toggleMute();
            this.soundBtnText.setText(nowMuted ? 'SOUND OFF' : 'SOUND ON');
            this.soundBtnText.setColor(nowMuted ? '#ef4444' : '#22c55e');
        });
    }

    private showHowToPlayModal() {
        if (this.modalContainer) return;
        window.history.pushState({ modal: 'guide' }, '');
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(500);

        const dim = this.add.zone(width / 2, height / 2, width, height).setOrigin(0.5).setInteractive();
        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.82);
        dimBg.fillRect(0, 0, width, height);
        dim.on('pointerdown', () => this.closeModal());
        this.modalContainer.add([dimBg, dim]);

        const panelW = 740;
        const panelH = 510;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panelBlocker = this.add.zone(width / 2, height / 2, panelW, panelH).setOrigin(0.5).setInteractive();
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(2, 0x475569);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add([panelBlocker, panel]);

        const title = this.add.text(width / 2, py + 40, '게임 조작 및 시스템 가이드', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '26px',
            color: '#f8fafc'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const guides = [
            '[기본 조작]',
            '• 1단 점프 / 2단 점프 : Space, W, ↑ 키 (모바일: 화면 우측 터치)',
            '• 슬라이드 / 공중 급강하 : S, ↓ 키 길게 누르기 (모바일: 화면 좌측 터치)',
            '• 초음속 대시 스킬 : Shift 또는 E 키 (쿨타임마다 무적 돌파 & 장애물 파괴)',
            '• 메인 화면 복귀 / 일시정지 : ESC 키 또는 우측 상단 [◀ 메인] 버튼',
            '',
            '[스테이지 캠페인 & 난이도]',
            '• 1단계부터 30단계까지 갈수록 주행 속도가 빨라지고 복합 장애물이 출현합니다.',
            '• 점프 직후 급강하 슬라이드, 연속 2단 점프, 구덩이 위 공중 장애물을 주의하세요.',
            '• 10단계(일타싸피), 20단계(배틀싸피)에서는 보스 레이드와 비주얼 코딩 미션이 진행됩니다.'
        ];

        const content = this.add.text(px + 42, py + 88, guides.join('\n'), {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#e2e8f0',
            lineSpacing: 8
        });
        this.modalContainer.add(content);

        const closeBtn = this.createButton(width / 2, py + panelH - 36, '◀ 메인 화면으로 돌아가기 (ESC)', 0x2563eb, 0x1d4ed8, () => {
            this.closeModal();
        }, 240, 40, '15px');
        this.modalContainer.add(closeBtn);
    }

    private async showLeaderboardModal() {
        if (this.modalContainer) return;
        window.history.pushState({ modal: 'leaderboard' }, '');
        const { width, height } = this.scale;

        this.modalContainer = this.add.container(0, 0).setDepth(500);

        const dim = this.add.zone(width / 2, height / 2, width, height).setOrigin(0.5).setInteractive();
        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.82);
        dimBg.fillRect(0, 0, width, height);
        dim.on('pointerdown', () => this.closeModal());
        this.modalContainer.add([dimBg, dim]);

        const panelW = 740;
        const panelH = 550;
        const px = (width - panelW) / 2;
        const py = (height - panelH) / 2;

        const panelBlocker = this.add.zone(width / 2, height / 2, panelW, panelH).setOrigin(0.5).setInteractive();
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(2, 0x475569);
        panel.fillRoundedRect(px, py, panelW, panelH, 16);
        panel.strokeRoundedRect(px, py, panelW, panelH, 16);
        this.modalContainer.add([panelBlocker, panel]);

        const title = this.add.text(width / 2, py + 40, '전국 명예의 전당 (TOP 10)', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '26px',
            color: '#f8fafc'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const loadingText = this.add.text(width / 2, py + 240, '실시간 랭킹 동기화 중...', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '18px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        this.modalContainer.add(loadingText);

        const result = await ScoreManager.fetchLeaderboard();
        if (!this.modalContainer) return;
        loadingText.destroy();

        const list = result.list;
        const maxDisplay = Math.min(8, list.length);
        list.slice(0, maxDisplay).forEach((item, idx) => {
            const rowY = py + 85 + idx * 46;

            const rowBg = this.add.graphics();
            rowBg.fillStyle(0x1e293b, 0.7);
            rowBg.lineStyle(1, idx === 0 ? 0xeab308 : 0x334155, 0.8);
            rowBg.fillRoundedRect(px + 30, rowY - 16, panelW - 60, 40, 8);
            rowBg.strokeRoundedRect(px + 30, rowY - 16, panelW - 60, 40, 8);
            this.modalContainer!.add(rowBg);

            const stageBadge = item.stage ? `[ST.${item.stage}]` : '';
            const rowText = this.add.text(px + 45, rowY + 4, `${idx + 1}위.  ${item.name}  ${stageBadge}`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '16px',
                color: idx === 0 ? '#fde047' : '#ffffff'
            }).setOrigin(0, 0.5);

            const statsText = this.add.text(px + panelW - 45, rowY + 4, `${item.score.toLocaleString()}점  (${item.distance}m / ${item.date})`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '15px',
                color: '#38bdf8'
            }).setOrigin(1, 0.5);

            this.modalContainer!.add([rowText, statsText]);
        });

        const closeBtn = this.createButton(width / 2, py + panelH - 36, '◀ 메인 화면으로 돌아가기 (ESC)', 0x2563eb, 0x1d4ed8, () => {
            this.closeModal();
        }, 240, 40, '15px');
        this.modalContainer.add(closeBtn);
    }
}
