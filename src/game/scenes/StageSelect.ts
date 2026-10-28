import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { StageManager, StageConfig, StageProgress } from '../utils/StageManager';
import { AudioManager } from '../utils/AudioManager';

export class StageSelect extends Scene {
    private audioManager: AudioManager;
    private currentChapter: number = 1;
    private cardsContainer?: Phaser.GameObjects.Container;
    private tabButtons: Phaser.GameObjects.Container[] = [];
    private popStateHandler?: () => void;

    constructor() {
        super('StageSelect');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x070b14, 0x070b14, 0x0f172a, 0x1e1b4b, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_s1_far')) {
            this.add.image(width / 2, height - 260, 'bg_s1_far').setAlpha(0.25);
        }

        // Determine current chapter based on highest unlocked stage
        const highest = StageManager.getHighestUnlockedStage();
        if (highest > 20) this.currentChapter = 3;
        else if (highest > 10) this.currentChapter = 2;
        else this.currentChapter = 1;

        // 2. Render Stage Cards FIRST so header buttons stay on top
        this.renderStageGrid();

        // 3. Chapter Selector Tabs
        this.createChapterTabs();

        // 4. Header Bar (Top-most depth = 500)
        this.createHeader();

        // 5. Keyboard & Browser Back Button Support (ESC, Backspace, Browser Back)
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => this.goBackToMain());
            this.input.keyboard.on('keydown-BACKSPACE', () => this.goBackToMain());
        }

        window.history.pushState({ scene: 'StageSelect' }, '');
        this.popStateHandler = () => {
            if (this.scene.isActive('StageSelect')) {
                this.scene.start('MainMenu');
            }
        };
        window.addEventListener('popstate', this.popStateHandler);

        this.events.once('shutdown', () => {
            if (this.popStateHandler) {
                window.removeEventListener('popstate', this.popStateHandler);
            }
        });
    }

    private goBackToMain() {
        this.audioManager.playClick();
        this.scene.start('MainMenu');
    }

    private createHeader() {
        const { width } = this.scale;

        // Prominent Back Button (Top-Left, Depth 500)
        const backBtn = this.createButton(105, 42, '◀ 메인 화면 (ESC)', 0x1e293b, 0x2563eb, () => {
            this.goBackToMain();
        }, 160, 44, '15px');
        backBtn.setDepth(500);

        // Title
        this.add.text(width / 2, 42, 'STAGE CAMPAIGN (1 ~ 30)', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '30px',
            color: '#38bdf8',
            stroke: '#0f172a',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(500);

        // Total Stars Badge
        const totalStars = StageManager.getTotalStars();
        const highestStage = StageManager.getHighestUnlockedStage();

        const badge = this.add.container(width - 145, 42).setDepth(500);
        const bBg = this.add.graphics();
        bBg.fillStyle(0x0f172a, 0.9);
        bBg.lineStyle(2, 0xfacc15);
        bBg.fillRoundedRect(-110, -19, 220, 38, 19);
        bBg.strokeRoundedRect(-110, -19, 220, 38, 19);

        const bText = this.add.text(0, 0, `★ ${totalStars} / 90   |   STAGE ${highestStage}`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#facc15'
        }).setOrigin(0.5);

        badge.add([bBg, bText]);
    }

    private createChapterTabs() {
        const { width } = this.scale;
        const tabsY = 98;

        const chapters = [
            { id: 1, label: 'CHAPTER 1 · 테헤란로 (1~10)' },
            { id: 2, label: 'CHAPTER 2 · 비상계단 (11~20)' },
            { id: 3, label: 'CHAPTER 3 · 코딩랩실 (21~30)' }
        ];

        const tabW = 340;
        const totalW = tabW * 3 + 20 * 2;
        const startX = (width - totalW) / 2 + tabW / 2;

        this.tabButtons = [];

        chapters.forEach((ch, idx) => {
            const tx = startX + idx * (tabW + 20);
            const tabBtn = this.createButton(tx, tabsY, ch.label, 0x1e293b, 0x2563eb, () => {
                this.currentChapter = ch.id;
                this.updateTabsVisual();
                this.renderStageGrid();
            }, tabW, 44, '15px');
            tabBtn.setDepth(400);
            this.tabButtons.push(tabBtn);
        });

        this.updateTabsVisual();
    }

    private updateTabsVisual() {
        this.tabButtons.forEach((btn, idx) => {
            const chId = idx + 1;
            const isActive = chId === this.currentChapter;
            btn.setScale(isActive ? 1.04 : 0.96);
            btn.setAlpha(isActive ? 1 : 0.65);
        });
    }

    private renderStageGrid() {
        if (this.cardsContainer) {
            this.cardsContainer.destroy();
        }

        const { width } = this.scale;
        this.cardsContainer = this.add.container(0, 0).setDepth(100);

        const highestUnlocked = StageManager.getHighestUnlockedStage();
        const stages = StageManager.STAGES.filter(s => s.chapter === this.currentChapter);

        const cols = 5;
        const cardW = 210;
        const cardH = 220;
        const gapX = 26;
        const gapY = 24;

        const totalGridW = cols * cardW + (cols - 1) * gapX;
        const startX = (width - totalGridW) / 2 + cardW / 2;
        const startY = 262;

        stages.forEach((stage, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cx = startX + col * (cardW + gapX);
            const cy = startY + row * (cardH + gapY);

            const isUnlocked = stage.id <= highestUnlocked;
            const progress = StageManager.getStageProgress(stage.id);

            const card = this.createStageCard(cx, cy, cardW, cardH, stage, isUnlocked, progress);
            this.cardsContainer!.add(card);
        });
    }

    private createStageCard(
        x: number,
        y: number,
        w: number,
        h: number,
        stage: StageConfig,
        isUnlocked: boolean,
        progress: StageProgress
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const borderColor = stage.bossType ? 0xef4444 : (isUnlocked ? 0x38bdf8 : 0x334155);
        const fillColor = isUnlocked ? (stage.bossType ? 0x2a0a18 : 0x111c30) : 0x090d16;

        bg.fillStyle(fillColor, isUnlocked ? 0.95 : 0.65);
        bg.lineStyle(isUnlocked ? 2 : 1, borderColor, isUnlocked ? 0.9 : 0.4);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
        container.add(bg);

        if (stage.bossType) {
            const badgeBg = this.add.graphics();
            badgeBg.fillStyle(0xef4444, 0.95);
            badgeBg.fillRoundedRect(-w / 2 + 12, -h / 2 + 10, 68, 20, 5);
            const badgeTxt = this.add.text(-w / 2 + 46, -h / 2 + 20, 'BOSS', {
                fontFamily: 'Arial Black',
                fontSize: '11px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add([badgeBg, badgeTxt]);
        }

        // Stage Number
        const stageNumText = this.add.text(0, -h / 2 + 38, `STAGE ${stage.id}`, {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '21px',
            color: isUnlocked ? '#facc15' : '#475569'
        }).setOrigin(0.5);

        // Title
        const cleanTitle = stage.title.replace(/^\d+단계:\s*/, '');
        const titleText = this.add.text(0, -h / 2 + 82, cleanTitle, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: isUnlocked ? '#ffffff' : '#475569',
            align: 'center',
            wordWrap: { width: w - 24 }
        }).setOrigin(0.5);

        // Subtitle / Pattern hint
        const subText = this.add.text(0, -h / 2 + 114, stage.subtitle, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '12px',
            color: isUnlocked ? '#94a3b8' : '#334155',
            align: 'center',
            wordWrap: { width: w - 24 }
        }).setOrigin(0.5);

        // Target distance & Speed info
        const distText = this.add.text(0, -h / 2 + 150, `목표 ${stage.targetDistance}m  ·  속도 ${stage.baseSpeed}`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: isUnlocked ? '#38bdf8' : '#334155'
        }).setOrigin(0.5);

        // Star Rating
        let starStr = '★ ☆ ☆';
        let starColor = '#475569';
        if (isUnlocked) {
            if (progress.stars === 3) { starStr = '★ ★ ★'; starColor = '#facc15'; }
            else if (progress.stars === 2) { starStr = '★ ★ ☆'; starColor = '#facc15'; }
            else if (progress.stars === 1) { starStr = '★ ☆ ☆'; starColor = '#facc15'; }
            else { starStr = '도전 가능 ▶'; starColor = '#22d3ee'; }
        } else {
            starStr = '잠김 (LOCKED)';
        }
        const starText = this.add.text(0, -h / 2 + 186, starStr, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '15px',
            color: starColor
        }).setOrigin(0.5);

        container.add([stageNumText, titleText, subText, distText, starText]);

        if (isUnlocked) {
            const hitZone = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
            container.add(hitZone);

            hitZone.on('pointerover', () => {
                container.setScale(1.04);
                bg.lineStyle(3, 0xfacc15, 1);
                bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
            });

            hitZone.on('pointerout', () => {
                container.setScale(1.0);
                bg.clear();
                bg.fillStyle(fillColor, 0.95);
                bg.lineStyle(2, borderColor, 0.9);
                bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
                bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
            });

            hitZone.on('pointerdown', () => {
                this.audioManager.playJump();
                this.scene.start('Game', {
                    mode: 'stage',
                    stageId: stage.id
                });
            });
        }

        return container;
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        normalColor: number,
        hoverColor: number,
        onClick: () => void,
        w: number,
        h: number,
        fontSize: string
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const draw = (color: number) => {
            bg.clear();
            bg.fillStyle(color, 0.95);
            bg.lineStyle(2, 0x38bdf8);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
        };
        draw(normalColor);

        const lbl = this.add.text(0, 0, text, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);

        const maxW = w - 16;
        if (lbl.width > maxW) {
            lbl.setScale(maxW / lbl.width);
        }

        const hitZone = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        container.add([bg, lbl, hitZone]);

        hitZone.on('pointerover', () => {
            draw(hoverColor);
            container.setScale(1.03);
        });

        hitZone.on('pointerout', () => {
            draw(normalColor);
            container.setScale(1.0);
        });

        hitZone.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }
}
