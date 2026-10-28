import { Scene } from 'phaser';
import { StageManager } from '../utils/StageManager';
import { AudioManager } from '../utils/AudioManager';

export class StageSelect extends Scene {
    private audioManager: AudioManager;
    private currentChapter: number = 1;
    private cardsContainer?: Phaser.GameObjects.Container;
    private tabButtons: Phaser.GameObjects.Container[] = [];

    constructor() {
        super('StageSelect');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(300, 10, 14, 26);

        // 1. Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x111827, 0x1e1b4b, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_s1_far')) {
            this.add.image(width / 2, height - 260, 'bg_s1_far').setAlpha(0.25);
        }

        // 2. Header Bar
        this.createHeader();

        // 3. Chapter Selector Tabs
        this.createChapterTabs();

        // Determine current chapter based on highest unlocked stage
        const highest = StageManager.getHighestUnlockedStage();
        if (highest > 20) this.currentChapter = 3;
        else if (highest > 10) this.currentChapter = 2;
        else this.currentChapter = 1;

        // 4. Render Stage Cards for Current Chapter
        this.renderStageGrid();
    }

    private createHeader() {
        const { width } = this.scale;

        // Back Button
        const backBtn = this.createButton(100, 42, '◀ 메인 메뉴', 0x1e293b, 0x334155, () => {
            this.scene.start('MainMenu');
        }, 130, 42, '14px');

        // Title
        this.add.text(width / 2, 42, '🗺️ SSAFY 30단계 코딩 로드맵', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '30px',
            color: '#38bdf8',
            stroke: '#0f172a',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Total Stars Badge
        const totalStars = StageManager.getTotalStars();
        const highestStage = StageManager.getHighestUnlockedStage();

        const badge = this.add.container(width - 150, 42);
        const bBg = this.add.graphics();
        bBg.fillStyle(0x0f172a, 0.85);
        bBg.lineStyle(1.5, 0xfacc15);
        bBg.fillRoundedRect(-110, -18, 220, 36, 18);
        bBg.strokeRoundedRect(-110, -18, 220, 36, 18);

        const bText = this.add.text(0, 0, `⭐ ${totalStars}/90  |  ST.${highestStage}`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#facc15'
        }).setOrigin(0.5);

        badge.add([bBg, bText]);
    }

    private createChapterTabs() {
        const { width } = this.scale;
        const tabsY = 96;

        const chapters = [
            { id: 1, label: '🏫 챕터 1: 알고리즘 기초 (1~10)' },
            { id: 2, label: '💻 챕터 2: 관통 프로젝트 (11~20)' },
            { id: 3, label: '🚀 챕터 3: 자율 프로젝트 (21~30)' }
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

            this.tabButtons.push(tabBtn);
        });

        this.updateTabsVisual();
    }

    private updateTabsVisual() {
        this.tabButtons.forEach((btn, idx) => {
            const chId = idx + 1;
            const isActive = chId === this.currentChapter;
            btn.setScale(isActive ? 1.05 : 0.96);
            btn.setAlpha(isActive ? 1 : 0.7);
        });
    }

    private renderStageGrid() {
        if (this.cardsContainer) {
            this.cardsContainer.destroy();
        }

        const { width } = this.scale;
        this.cardsContainer = this.add.container(0, 0);

        const highestUnlocked = StageManager.getHighestUnlockedStage();

        // 10 Stages per Chapter
        const startStageId = (this.currentChapter - 1) * 10 + 1;
        const stages = StageManager.STAGES.filter(s => s.chapter === this.currentChapter);

        // 5 columns x 2 rows
        const cols = 5;
        const cardW = 210;
        const cardH = 220;
        const gapX = 26;
        const gapY = 24;

        const totalGridW = cols * cardW + (cols - 1) * gapX;
        const startX = (width - totalGridW) / 2 + cardW / 2;
        const startY = 260;

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
        stage: any,
        isUnlocked: boolean,
        progress: any
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const borderColor = stage.bossType ? 0xef4444 : (isUnlocked ? 0x38bdf8 : 0x334155);
        const fillColor = isUnlocked ? (stage.bossType ? 0x2e1022 : 0x111c30) : 0x0f172a;

        bg.fillStyle(fillColor, isUnlocked ? 0.95 : 0.6);
        bg.lineStyle(isUnlocked ? 2 : 1, borderColor, isUnlocked ? 0.9 : 0.4);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
        container.add(bg);

        // Boss or Special Badge on top
        if (stage.bossType) {
            const badgeBg = this.add.graphics();
            badgeBg.fillStyle(0xef4444, 0.9);
            badgeBg.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, 86, 20, 6);
            const badgeTxt = this.add.text(-w / 2 + 53, -h / 2 + 18, '🔥 BOSS', {
                fontFamily: '"Black Han Sans", sans-serif',
                fontSize: '11px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add([badgeBg, badgeTxt]);
        }

        // Stage Number
        const stageNumText = this.add.text(0, -h / 2 + 35, `STAGE ${stage.id}`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '20px',
            color: isUnlocked ? '#facc15' : '#64748b'
        }).setOrigin(0.5);

        // Stage Icon
        let iconChar = '🏁';
        if (stage.bossType === 'iltassafy') iconChar = '🎱';
        else if (stage.bossType === 'battlessafy') iconChar = '⚔️';
        else if (stage.id === 30) iconChar = '🎓';
        else if (!isUnlocked) iconChar = '🔒';

        const icon = this.add.text(0, -h / 2 + 75, iconChar, {
            fontSize: '34px'
        }).setOrigin(0.5);

        // Title
        const titleText = this.add.text(0, -h / 2 + 120, stage.title.replace(/^\d+단계:\s*/, ''), {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '14px',
            color: isUnlocked ? '#ffffff' : '#475569',
            align: 'center',
            wordWrap: { width: w - 24 }
        }).setOrigin(0.5);

        // Target distance
        const distText = this.add.text(0, -h / 2 + 155, `🎯 목표: ${stage.targetDistance}m`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: isUnlocked ? '#38bdf8' : '#334155'
        }).setOrigin(0.5);

        // Star Rating (⭐⭐⭐)
        let starStr = '☆☆☆';
        if (isUnlocked) {
            if (progress.stars === 3) starStr = '⭐⭐⭐';
            else if (progress.stars === 2) starStr = '⭐⭐☆';
            else if (progress.stars === 1) starStr = '⭐☆☆';
        }
        const starText = this.add.text(0, -h / 2 + 185, starStr, {
            fontSize: '16px'
        }).setOrigin(0.5);

        container.add([stageNumText, icon, titleText, distText, starText]);

        // Interactivity if unlocked
        if (isUnlocked) {
            container.setSize(w, h);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
                container.setScale(1.05);
                bg.lineStyle(3, 0xfacc15, 1);
                bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
            });

            container.on('pointerout', () => {
                container.setScale(1.0);
                bg.clear();
                bg.fillStyle(fillColor, 0.95);
                bg.lineStyle(2, borderColor, 0.9);
                bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
                bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
            });

            container.on('pointerdown', () => {
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
            bg.lineStyle(1.5, 0x38bdf8);
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

        container.add([bg, lbl]);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            draw(hoverColor);
            container.setScale(1.03);
        });

        container.on('pointerout', () => {
            draw(normalColor);
            container.setScale(1.0);
        });

        container.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }
}
