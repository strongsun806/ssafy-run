import * as Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export type BlockCategory = 'all' | 'event' | 'motion' | 'control' | 'looks' | 'sensing';

export interface ScratchBlockDef {
    id: string;
    category: BlockCategory;
    text: string;
    icon: string;
    param?: string;
    color: number;
    isCorrect: boolean;
    order: number;
    speechText?: string;
}

export class BlockCodingModal {
    private scene: Phaser.Scene;
    private type: 'iltassafy' | 'battlessafy';
    private audioManager: AudioManager;
    private onComplete: (scoreBonus: number, coinBonus: number) => void;

    private container!: Phaser.GameObjects.Container;
    private placedBlocks: ScratchBlockDef[] = [];
    private blockWorkspaceContainer!: Phaser.GameObjects.Container;
    private paletteContainer!: Phaser.GameObjects.Container;
    private statusText!: Phaser.GameObjects.Text;
    private isSimulating: boolean = false;
    private currentCategory: BlockCategory = 'all';

    // Simulation visual elements
    private simContainer!: Phaser.GameObjects.Container;
    private cueBall?: Phaser.GameObjects.Arc;
    private targetBall?: Phaser.GameObjects.Arc;
    private obstacleBall?: Phaser.GameObjects.Arc;
    private cueStick?: Phaser.GameObjects.Graphics;
    private speechBubble?: Phaser.GameObjects.Container;

    private playerTank?: Phaser.GameObjects.Container;
    private enemyTank?: Phaser.GameObjects.Container;

    constructor(
        scene: Phaser.Scene,
        type: 'iltassafy' | 'battlessafy',
        audioManager: AudioManager,
        onComplete: (scoreBonus: number, coinBonus: number) => void
    ) {
        this.scene = scene;
        this.type = type;
        this.audioManager = audioManager;
        this.onComplete = onComplete;

        this.createModal();
    }

    private getAllBlocks(): ScratchBlockDef[] {
        if (this.type === 'iltassafy') {
            return [
                // Event (Yellow)
                { id: 'event_flag', category: 'event', icon: '🚩', text: '깃발을 클릭했을 때', color: 0xeab308, isCorrect: true, order: 1 },
                // Motion (Blue)
                { id: 'motion_angle', category: 'motion', icon: '📐', text: '조준 각도를', param: '45°', color: 0x2563eb, isCorrect: true, order: 2, speechText: '조준 각도 45° 설정!' },
                { id: 'motion_cushion', category: 'motion', icon: '🔄', text: '벽에 닿으면 튕기기 (원쿠션)', color: 0x2563eb, isCorrect: true, order: 3, speechText: '쿠션 반사 궤적 연산!' },
                { id: 'motion_spin', category: 'motion', icon: '↪️', text: '상단 스핀 회전 주기', color: 0x2563eb, isCorrect: false, order: 99 },
                { id: 'motion_wrong_angle', category: 'motion', icon: '❌', text: '조준 각도를', param: '180°', color: 0x475569, isCorrect: false, order: 99 },
                // Control (Orange)
                { id: 'ctrl_power', category: 'control', icon: '⚡', text: '타구 파워를', param: '80%', color: 0xea580c, isCorrect: true, order: 4, speechText: '타구 파워 80% 장전!' },
                { id: 'ctrl_wait', category: 'control', icon: '⏱️', text: '0.3초 조준 대기하기', color: 0xea580c, isCorrect: false, order: 99 },
                { id: 'ctrl_wrong_power', category: 'control', icon: '⚠️', text: '타구 파워를', param: '10%', color: 0x475569, isCorrect: false, order: 99 },
                // Looks & Sound (Purple)
                { id: 'looks_shoot', category: 'looks', icon: '🎱', text: '큐대로 수구(하얀공) 치기!', color: 0x9333ea, isCorrect: true, order: 5, speechText: '원쿠션 포켓인 샷!' },
                { id: 'sound_hit', category: 'looks', icon: '🔊', text: "'딱!' 타구 효과음 재생", color: 0x9333ea, isCorrect: false, order: 99 },
                { id: 'looks_say', category: 'looks', icon: '💬', text: '"포켓인 성공!" 말하기', color: 0x9333ea, isCorrect: false, order: 99 },
                // Sensing (Cyan)
                { id: 'sense_goal', category: 'sensing', icon: '🎯', text: '목적구가 홀컵에 닿았는가?', color: 0x06b6d4, isCorrect: false, order: 99 },
                { id: 'sense_dist', category: 'sensing', icon: '🔍', text: '목적구까지의 거리 계산', color: 0x06b6d4, isCorrect: false, order: 99 }
            ];
        } else {
            return [
                // Event (Yellow)
                { id: 'event_flag', category: 'event', icon: '🚩', text: '깃발을 클릭했을 때', color: 0xeab308, isCorrect: true, order: 1 },
                // Motion (Blue)
                { id: 'motion_forward', category: 'motion', icon: '🚀', text: '앞으로', param: '2칸', color: 0x2563eb, isCorrect: true, order: 2, speechText: '전방 2칸 기동!' },
                { id: 'motion_turn', category: 'motion', icon: '🔄', text: '우측으로', param: '90° 회전', color: 0x2563eb, isCorrect: true, order: 3, speechText: '포탑 우측 90도 선회!' },
                { id: 'motion_wrong_back', category: 'motion', icon: '⚡', text: '뒤로 3칸 후진하기', color: 0x475569, isCorrect: false, order: 99 },
                { id: 'motion_wrong_stop', category: 'motion', icon: '🛑', text: '엔진 정지 (무방비)', color: 0x475569, isCorrect: false, order: 99 },
                // Sensing (Cyan)
                { id: 'sense_radar', category: 'sensing', icon: '📡', text: '적 보스 탱크 레이더 락온', color: 0x06b6d4, isCorrect: true, order: 4, speechText: '적 보스 전차 타겟 락온!' },
                { id: 'sense_distance', category: 'sensing', icon: '🔍', text: '적과의 거리 <= 3칸 감지', color: 0x06b6d4, isCorrect: false, order: 99 },
                // Control (Orange)
                { id: 'ctrl_aim_wait', category: 'control', icon: '⏱️', text: '포탑 안정화 0.3초 대기', color: 0xea580c, isCorrect: false, order: 99 },
                { id: 'ctrl_repeat', category: 'control', icon: '🔁', text: '목표 파괴까지 반복', color: 0xea580c, isCorrect: false, order: 99 },
                // Looks & Sound (Purple)
                { id: 'looks_fire', category: 'looks', icon: '💥', text: '주포 철갑탄 1발 발사!', color: 0x9333ea, isCorrect: true, order: 5, speechText: '주포 철갑탄 발사!' },
                { id: 'sound_boom', category: 'looks', icon: '🔊', text: "'쾅!' 폭발음 재생하기", color: 0x9333ea, isCorrect: false, order: 99 },
                { id: 'looks_shield', category: 'looks', icon: '🛡️', text: '방어막 에너지 실드 전개', color: 0x9333ea, isCorrect: false, order: 99 },
                { id: 'looks_say', category: 'looks', icon: '💬', text: '"목표 격파 완료!" 말하기', color: 0x9333ea, isCorrect: false, order: 99 }
            ];
        }
    }

    private createModal() {
        const { width, height } = this.scene.scale;
        this.container = this.scene.add.container(width / 2, height / 2).setDepth(300);

        // Dim background overlay
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.88);
        dim.fillRect(-width / 2, -height / 2, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
        this.container.add(dim);

        // Main Dialog Card
        const cardW = 1080;
        const cardH = 610;
        const frame = this.scene.add.graphics();
        frame.fillStyle(0x0b1329, 0.98);
        frame.lineStyle(2, 0x4f46e5);
        frame.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        frame.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        this.container.add(frame);

        // Header Section
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x4338ca, 0.5);
        badgeBg.lineStyle(1, 0x818cf8);
        badgeBg.fillRoundedRect(-180, -cardH / 2 + 14, 360, 24, 12);
        badgeBg.strokeRoundedRect(-180, -cardH / 2 + 14, 360, 24, 12);

        const badgeText = this.scene.add.text(0, -cardH / 2 + 26, '🐱 SCRATCH CODING BREAK · 스크래치 알고리즘', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#a5b4fc'
        }).setOrigin(0.5);

        const titleText = this.type === 'iltassafy'
            ? '🎱 일타싸피 스크래치: 목적구 포켓인 코딩'
            : '⚔️ 배틀싸피 스크래치: 사이버 탱크 사격 코딩';

        const title = this.scene.add.text(0, -cardH / 2 + 58, titleText, {
            fontFamily: '"Black Han Sans", "Permanent Marker", sans-serif',
            fontSize: '24px',
            color: '#facc15'
        }).setOrigin(0.5);

        const subText = this.type === 'iltassafy'
            ? '스크래치 블록을 조립하여 공을 포켓에 넣고 멘탈(HP) 100% 회복 & 골든 피버를 획득하세요!'
            : '스크래치 블록을 조립하여 적 탱크를 격파하고 멘탈(HP) 100% 회복 & 골든 피버를 획득하세요!';

        const subtitle = this.scene.add.text(0, -cardH / 2 + 88, subText, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Fast Skip Button
        const skipBtn = this.createButton(cardW / 2 - 80, -cardH / 2 + 35, 110, 32, '⚡ 즉시 패스', 0x334155, () => {
            this.finishMiniGame(3000, 15);
        });

        this.container.add([badgeBg, badgeText, title, subtitle, skipBtn]);

        // Left Panel: Simulation Viewport
        this.createSimulationPanel(-cardW / 2 + 25, -cardH / 2 + 115, 450, 460);

        // Right Panel: Scratch IDE (Palette + Stack)
        this.createScratchIdePanel(15, -cardH / 2 + 115, 500, 465);

        // Auto-place initial Flag block
        const flagBlock = this.getAllBlocks().find(b => b.id === 'event_flag');
        if (flagBlock) {
            this.placedBlocks.push(flagBlock);
            this.renderWorkspaceBlocks();
        }

        // Entrance animation
        this.container.setScale(0.8);
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    // --- Simulation Viewport ---
    private createSimulationPanel(x: number, y: number, w: number, h: number) {
        this.simContainer = this.scene.add.container(x, y);
        this.container.add(this.simContainer);

        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0x0f172a, 0.95);
        panelBg.lineStyle(1.5, 0x334155);
        panelBg.fillRoundedRect(0, 0, w, h, 14);
        panelBg.strokeRoundedRect(0, 0, w, h, 14);
        this.simContainer.add(panelBg);

        const label = this.scene.add.text(15, 12, '🎬 LIVE SIMULATION STAGE (스크래치 실행 무대)', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '12px',
            color: '#38bdf8'
        });
        this.simContainer.add(label);

        if (this.type === 'iltassafy') {
            this.setupBilliardsSim(w, h);
        } else {
            this.setupTankSim(w, h);
        }
    }

    private setupBilliardsSim(w: number, h: number) {
        // Green Felt Pool Table
        const felt = this.scene.add.graphics();
        felt.fillStyle(0x065f46, 1);
        felt.lineStyle(10, 0x78350f);
        felt.fillRoundedRect(20, 40, w - 40, h - 60, 16);
        felt.strokeRoundedRect(20, 40, w - 40, h - 60, 16);
        this.simContainer.add(felt);

        // 6 Pockets
        const pocketCoords = [
            { x: 38, y: 58 }, { x: w / 2, y: 50 }, { x: w - 38, y: 58 },
            { x: 38, y: h - 38 }, { x: w / 2, y: h - 30 }, { x: w - 38, y: h - 38 }
        ];

        pocketCoords.forEach(p => {
            const hole = this.scene.add.circle(p.x, p.y, 15, 0x020617);
            const holeBorder = this.scene.add.circle(p.x, p.y, 15).setStrokeStyle(2, 0x334155);
            this.simContainer.add([hole, holeBorder]);
        });

        // Glowing Target Pocket (Top-Right)
        const targetHole = pocketCoords[2];
        const targetRing = this.scene.add.circle(targetHole.x, targetHole.y, 24).setStrokeStyle(2.5, 0xfacc15);
        const goalBadge = this.scene.add.text(targetHole.x - 32, targetHole.y + 20, '🎯 GOAL', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '12px',
            color: '#facc15'
        });
        this.simContainer.add([targetRing, goalBadge]);

        this.scene.tweens.add({
            targets: targetRing,
            scale: 1.3,
            alpha: 0.4,
            yoyo: true,
            repeat: -1,
            duration: 650
        });

        // Obstacle Ball
        this.obstacleBall = this.scene.add.circle(220, 210, 12, 0xeab308);
        this.obstacleBall.setStrokeStyle(2, 0x713f12);

        // Target Ball (Red)
        this.targetBall = this.scene.add.circle(260, 150, 12, 0xef4444);
        this.targetBall.setStrokeStyle(2, 0x7f1d1d);

        // Cue Ball (White)
        this.cueBall = this.scene.add.circle(95, 310, 12, 0xf8fafc);
        this.cueBall.setStrokeStyle(2, 0x94a3b8);

        // Cue Stick
        this.cueStick = this.scene.add.graphics();
        this.drawCueStick(95, 310, 45);

        this.simContainer.add([this.obstacleBall, this.targetBall, this.cueBall, this.cueStick]);
    }

    private drawCueStick(ballX: number, ballY: number, angleDeg: number) {
        if (!this.cueStick) return;
        this.cueStick.clear();

        const rad = Phaser.Math.DegToRad(angleDeg + 180);
        const startX = ballX + Math.cos(rad) * 22;
        const startY = ballY + Math.sin(rad) * 22;
        const endX = ballX + Math.cos(rad) * 125;
        const endY = ballY + Math.sin(rad) * 125;

        this.cueStick.lineStyle(6, 0xd97706);
        this.cueStick.lineBetween(startX, startY, endX, endY);
        this.cueStick.fillStyle(0xf8fafc);
        this.cueStick.fillCircle(startX, startY, 3.5);
    }

    private setupTankSim(w: number, h: number) {
        // Tactical Grid
        const gridG = this.scene.add.graphics();
        gridG.fillStyle(0x0a101f, 1);
        gridG.lineStyle(1, 0x1e293b);
        gridG.fillRoundedRect(20, 40, w - 40, h - 60, 12);
        gridG.strokeRoundedRect(20, 40, w - 40, h - 60, 12);

        for (let gx = 80; gx < w - 40; gx += 60) {
            gridG.lineBetween(gx, 40, gx, h - 20);
        }
        for (let gy = 80; gy < h - 20; gy += 60) {
            gridG.lineBetween(20, gy, w - 20, gy);
        }
        this.simContainer.add(gridG);

        // Concrete Barricades
        const barrier1 = this.scene.add.rectangle(195, 200, 36, 65, 0x475569);
        barrier1.setStrokeStyle(2, 0x64748b);
        const barrier2 = this.scene.add.rectangle(195, 280, 36, 65, 0x475569);
        barrier2.setStrokeStyle(2, 0x64748b);
        this.simContainer.add([barrier1, barrier2]);

        // Player Tank
        this.playerTank = this.scene.add.container(70, 310);
        const tankBody = this.scene.add.rectangle(0, 0, 38, 28, 0x0284c7);
        tankBody.setStrokeStyle(2, 0x38bdf8);
        const turret = this.scene.add.circle(0, 0, 10, 0x0369a1);
        const barrel = this.scene.add.rectangle(16, 0, 18, 5, 0x38bdf8);
        this.playerTank.add([tankBody, turret, barrel]);
        this.simContainer.add(this.playerTank);

        // Enemy Tank
        this.enemyTank = this.scene.add.container(360, 105);
        const enemyBody = this.scene.add.rectangle(0, 0, 44, 34, 0xb91c1c);
        enemyBody.setStrokeStyle(2, 0xef4444);
        const enemyTurret = this.scene.add.circle(0, 0, 12, 0x991b1b);
        const enemyBarrel = this.scene.add.rectangle(-20, 0, 20, 6, 0xef4444);
        const bossTag = this.scene.add.text(0, -30, '적 보스 탱크 AI', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '11px',
            color: '#ef4444'
        }).setOrigin(0.5);
        this.enemyTank.add([enemyBody, enemyTurret, enemyBarrel, bossTag]);
        this.simContainer.add(this.enemyTank);
    }

    // Scratch Character Speech Bubble
    private showSpeechBubble(x: number, y: number, text: string) {
        if (this.speechBubble) {
            this.speechBubble.destroy();
        }

        this.speechBubble = this.scene.add.container(x, y - 45);
        const txt = this.scene.add.text(0, 0, text, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#0f172a'
        }).setOrigin(0.5);

        const bw = Math.max(txt.width + 20, 100);
        const bh = 28;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0xffffff, 0.95);
        bg.lineStyle(1.5, 0x94a3b8);
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);

        // Pointer triangle
        bg.fillTriangle(-5, bh / 2, 5, bh / 2, 0, bh / 2 + 7);

        this.speechBubble.add([bg, txt]);
        this.simContainer.add(this.speechBubble);

        this.scene.tweens.add({
            targets: this.speechBubble,
            scale: { from: 0.5, to: 1 },
            duration: 180,
            ease: 'Back.easeOut'
        });
    }

    // --- Right Panel: Scratch IDE ---
    private createScratchIdePanel(x: number, y: number, w: number, h: number) {
        const ideContainer = this.scene.add.container(x, y);
        this.container.add(ideContainer);

        // 1. Scratch Category Tabs
        const categories: { id: BlockCategory; label: string; color: number }[] = [
            { id: 'all', label: '🌈 전체', color: 0x64748b },
            { id: 'event', label: '🟡 이벤트', color: 0xeab308 },
            { id: 'motion', label: '🔵 동작', color: 0x2563eb },
            { id: 'control', label: '🟠 제어', color: 0xea580c },
            { id: 'looks', label: '🟣 형태/소리', color: 0x9333ea },
            { id: 'sensing', label: '🔴 감지', color: 0x06b6d4 }
        ];

        const tabW = 78;
        categories.forEach((cat, idx) => {
            const tx = idx * (tabW + 5);
            const tabBtn = this.createCategoryTab(tx, 0, tabW, 26, cat.label, cat.id);
            ideContainer.add(tabBtn);
        });

        // 2. Scratch Block Palette Box
        const palBox = this.scene.add.graphics();
        palBox.fillStyle(0x0f172a, 0.9);
        palBox.lineStyle(1, 0x1e293b);
        palBox.fillRoundedRect(0, 32, w, 160, 10);
        palBox.strokeRoundedRect(0, 32, w, 160, 10);
        ideContainer.add(palBox);

        this.paletteContainer = this.scene.add.container(8, 40);
        ideContainer.add(this.paletteContainer);
        this.renderPaletteBlocks();

        // 3. Workspace Section Header
        const wsY = 205;
        const wsTitle = this.scene.add.text(0, wsY, '🧩 스크래치 스택 (조립된 코드 블록)', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#facc15'
        });

        const autoBtn = this.createButton(w - 180, wsY + 10, 115, 26, '💡 정답 자동조립', 0x059669, () => {
            this.autoFillCorrectBlocks();
        });

        const resetBtn = this.createButton(w - 55, wsY + 10, 50, 26, '↺ 비우기', 0x475569, () => {
            this.placedBlocks = [];
            const flagBlock = this.getAllBlocks().find(b => b.id === 'event_flag');
            if (flagBlock) this.placedBlocks.push(flagBlock);
            this.renderWorkspaceBlocks();
            this.audioManager.playBlockClick();
        });

        ideContainer.add([wsTitle, autoBtn, resetBtn]);

        // 4. Scratch Workspace Canvas
        const wsBox = this.scene.add.graphics();
        wsBox.fillStyle(0x020617, 0.95);
        wsBox.lineStyle(1.5, 0x334155);
        wsBox.fillRoundedRect(0, wsY + 28, w, 165, 12);
        wsBox.strokeRoundedRect(0, wsY + 28, w, 165, 12);
        ideContainer.add(wsBox);

        this.blockWorkspaceContainer = this.scene.add.container(10, wsY + 36);
        ideContainer.add(this.blockWorkspaceContainer);
        this.renderWorkspaceBlocks();

        // 5. Status Text
        this.statusText = this.scene.add.text(w / 2, wsY + 208, '💡 위 팔레트의 블록을 클릭해 아래 스택에 조립하세요!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        ideContainer.add(this.statusText);

        // 6. Scratch Run Button (Green Flag Button)
        const runBtn = this.createScratchRunButton(w / 2, wsY + 242, w - 20, 46, '🚩 스크래치 알고리즘 실행 (Run Code)', () => {
            this.executeAlgorithm();
        });
        ideContainer.add(runBtn);
    }

    private createCategoryTab(x: number, y: number, w: number, h: number, text: string, category: BlockCategory) {
        const c = this.scene.add.container(x, y);
        const isActive = this.currentCategory === category;

        const bg = this.scene.add.graphics();
        bg.fillStyle(isActive ? 0x4f46e5 : 0x1e293b, 0.9);
        bg.fillRoundedRect(0, 0, w, h, 6);

        const label = this.scene.add.text(w / 2, h / 2, text, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '12px',
            color: isActive ? '#ffffff' : '#cbd5e1'
        }).setOrigin(0.5);

        c.add([bg, label]);
        c.setSize(w, h);
        c.setInteractive({ useHandCursor: true });

        c.on('pointerdown', () => {
            this.currentCategory = category;
            this.renderPaletteBlocks();
            this.audioManager.playBlockClick();
        });

        return c;
    }

    private renderPaletteBlocks() {
        this.paletteContainer.removeAll(true);

        const all = this.getAllBlocks();
        const filtered = this.currentCategory === 'all'
            ? all
            : all.filter(b => b.category === this.currentCategory);

        // 2 columns grid
        filtered.forEach((blk, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            if (row >= 4) return; // Display up to 8 blocks per page

            const bx = col * 242;
            const by = row * 36;

            const chip = this.createScratchPaletteBlock(bx, by, 236, 32, blk);
            this.paletteContainer.add(chip);
        });
    }

    // Scratch Puzzle Block Shape
    private createScratchPaletteBlock(x: number, y: number, w: number, h: number, blk: ScratchBlockDef) {
        const c = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        bg.fillStyle(blk.color, 0.95);
        bg.lineStyle(1, 0xffffff, 0.35);

        // Scratch block notch
        if (blk.category === 'event') {
            // Hat curved top
            bg.fillRoundedRect(0, 4, w, h - 4, 6);
            bg.fillCircle(24, 6, 12);
        } else {
            bg.fillRoundedRect(0, 0, w, h, 6);
        }
        bg.strokeRoundedRect(0, 0, w, h, 6);

        const iconTxt = this.scene.add.text(8, h / 2, blk.icon, { fontSize: '13px' }).setOrigin(0, 0.5);
        const nameTxt = this.scene.add.text(28, h / 2, blk.text, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        c.add([bg, iconTxt, nameTxt]);

        // Input Param Pill
        if (blk.param) {
            const pillX = nameTxt.x + nameTxt.width + 6;
            const pill = this.scene.add.graphics();
            pill.fillStyle(0xffffff, 0.9);
            pill.fillRoundedRect(pillX, 6, 44, 20, 10);

            const paramTxt = this.scene.add.text(pillX + 22, 16, blk.param, {
                fontFamily: '"Impact", sans-serif',
                fontSize: '11px',
                color: '#0f172a'
            }).setOrigin(0.5);

            c.add([pill, paramTxt]);
        }

        c.setSize(w, h);
        c.setInteractive({ useHandCursor: true });

        c.on('pointerover', () => c.setScale(1.02));
        c.on('pointerout', () => c.setScale(1));
        c.on('pointerdown', () => {
            this.addBlockToWorkspace(blk);
        });

        return c;
    }

    private addBlockToWorkspace(blk: ScratchBlockDef) {
        if (this.isSimulating) return;
        if (this.placedBlocks.length >= 7) {
            this.statusText.setText('⚠️ 스크래치 스택이 가득 찼습니다! (최대 7개)');
            this.statusText.setColor('#f87171');
            return;
        }

        this.placedBlocks.push(blk);
        this.audioManager.playBlockClick();
        this.renderWorkspaceBlocks();
        this.statusText.setText(`블록 추가됨: ${blk.icon} ${blk.text}`);
        this.statusText.setColor('#38bdf8');
    }

    private autoFillCorrectBlocks() {
        if (this.isSimulating) return;
        const corrects = this.getAllBlocks()
            .filter(b => b.isCorrect)
            .sort((a, b) => a.order - b.order);

        this.placedBlocks = [...corrects];
        this.audioManager.playBlockClick();
        this.renderWorkspaceBlocks();
        this.statusText.setText('✨ 정답 스크래치 블록들이 알맞게 조립되었습니다! [실행 버튼]을 누르세요!');
        this.statusText.setColor('#4ade80');
    }

    private renderWorkspaceBlocks() {
        this.blockWorkspaceContainer.removeAll(true);

        if (this.placedBlocks.length === 0) {
            const emptyLabel = this.scene.add.text(230, 60, '(위 팔레트에서 블록을 클릭하여 스택에 조립하세요)', {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '14px',
                color: '#475569'
            }).setOrigin(0.5);
            this.blockWorkspaceContainer.add(emptyLabel);
            return;
        }

        // Render stacked scratch blocks vertically
        this.placedBlocks.forEach((blk, idx) => {
            const col = idx < 4 ? 0 : 1;
            const row = idx < 4 ? idx : idx - 4;
            const bx = col * 242;
            const by = row * 38;

            const chip = this.scene.add.container(bx, by);

            const bg = this.scene.add.graphics();
            bg.fillStyle(blk.color, 0.95);
            bg.lineStyle(1.5, 0xffffff, 0.5);

            if (blk.category === 'event') {
                bg.fillRoundedRect(0, 4, 236, 30, 6);
                bg.fillCircle(24, 6, 11);
            } else {
                bg.fillRoundedRect(0, 0, 236, 34, 6);
            }
            bg.strokeRoundedRect(0, 0, 236, 34, 6);

            const numTxt = this.scene.add.text(8, 17, `${idx + 1}.`, {
                fontFamily: '"Impact", sans-serif',
                fontSize: '12px',
                color: '#facc15'
            }).setOrigin(0, 0.5);

            const iconTxt = this.scene.add.text(24, 17, blk.icon, { fontSize: '12px' }).setOrigin(0, 0.5);

            const nameTxt = this.scene.add.text(42, 17, blk.text, {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '12px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            const delIcon = this.scene.add.text(224, 17, '✕', {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#cbd5e1'
            }).setOrigin(0.5);

            chip.add([bg, numTxt, iconTxt, nameTxt, delIcon]);

            if (blk.param) {
                const paramX = nameTxt.x + nameTxt.width + 4;
                const pill = this.scene.add.graphics();
                pill.fillStyle(0xffffff, 0.95);
                pill.fillRoundedRect(paramX, 7, 38, 20, 10);

                const paramLabel = this.scene.add.text(paramX + 19, 17, blk.param, {
                    fontFamily: '"Impact", sans-serif',
                    fontSize: '11px',
                    color: '#0f172a'
                }).setOrigin(0.5);

                chip.add([pill, paramLabel]);
            }

            chip.setSize(236, 34);
            chip.setInteractive({ useHandCursor: true });

            chip.on('pointerdown', () => {
                if (this.isSimulating) return;
                this.placedBlocks.splice(idx, 1);
                this.audioManager.playBlockClick();
                this.renderWorkspaceBlocks();
            });

            this.blockWorkspaceContainer.add(chip);
        });
    }

    // --- Execution & Simulation ---
    private executeAlgorithm() {
        if (this.isSimulating) return;

        if (this.placedBlocks.length < 2) {
            this.statusText.setText('⚠️ 스크래치 블록을 최소 2개 이상 조립해주세요!');
            this.statusText.setColor('#f87171');
            this.audioManager.playCompileFail();
            return;
        }

        this.isSimulating = true;
        this.statusText.setText('⚙️ 스크래치 알고리즘 순차 실행 및 연산 중...');
        this.statusText.setColor('#38bdf8');

        // Check if all correct blocks are included and no fail blocks
        const hasWrong = this.placedBlocks.some(b => !b.isCorrect);
        const correctIds = this.getAllBlocks().filter(b => b.isCorrect).map(b => b.id);
        const placedIds = this.placedBlocks.map(b => b.id);
        const hasAll = correctIds.every(id => placedIds.includes(id));

        const isSuccess = !hasWrong && hasAll;

        // Step by step Scratch execution simulation
        this.runStepByStep(0, isSuccess);
    }

    private runStepByStep(stepIndex: number, isSuccess: boolean) {
        if (stepIndex >= this.placedBlocks.length) {
            // Execution sequence finished
            if (isSuccess) {
                this.handleMiniGameSuccess();
            } else {
                this.handleMiniGameFail('❌ 런타임 에러: 목적구에 도달하지 못했습니다! [💡 정답 자동조립]을 눌러보세요.');
            }
            return;
        }

        const blk = this.placedBlocks[stepIndex];
        this.audioManager.playBlockClick();

        // Highlight active block in workspace
        const chip = this.blockWorkspaceContainer.list[stepIndex] as Phaser.GameObjects.Container;
        if (chip) {
            this.scene.tweens.add({
                targets: chip,
                scale: 1.08,
                duration: 120,
                yoyo: true
            });
        }

        // Show Scratch Speech Bubble if specified
        if (blk.speechText) {
            if (this.type === 'iltassafy' && this.cueBall) {
                this.showSpeechBubble(this.cueBall.x, this.cueBall.y, blk.speechText);
            } else if (this.type === 'battlessafy' && this.playerTank) {
                this.showSpeechBubble(this.playerTank.x, this.playerTank.y, blk.speechText);
            }
        }

        // Action trigger based on block
        if (blk.id === 'looks_shoot') {
            this.triggerBilliardsStrike(isSuccess);
        } else if (blk.id === 'motion_forward' && this.playerTank) {
            this.scene.tweens.add({
                targets: this.playerTank,
                x: 180,
                duration: 350,
                ease: 'Cubic.easeOut'
            });
        } else if (blk.id === 'motion_turn' && this.playerTank) {
            this.scene.tweens.add({
                targets: this.playerTank,
                angle: -90,
                duration: 250
            });
        } else if (blk.id === 'looks_fire' && this.playerTank) {
            this.triggerTankFire(isSuccess);
        }

        this.scene.time.delayedCall(450, () => {
            this.runStepByStep(stepIndex + 1, isSuccess);
        });
    }

    private triggerBilliardsStrike(isSuccess: boolean) {
        if (!this.cueBall || !this.targetBall || !this.cueStick) return;

        this.scene.tweens.add({
            targets: this.cueStick,
            x: -16,
            y: -16,
            duration: 180,
            yoyo: true,
            onComplete: () => {
                this.audioManager.playHit();
                this.cueStick?.setVisible(false);

                if (isSuccess) {
                    this.scene.tweens.add({
                        targets: this.cueBall,
                        x: 235,
                        y: 175,
                        duration: 350,
                        ease: 'Cubic.easeOut',
                        onComplete: () => {
                            this.audioManager.playHit();
                            this.scene.tweens.add({
                                targets: this.targetBall,
                                x: 412,
                                y: 58,
                                duration: 420,
                                ease: 'Cubic.easeOut',
                                onComplete: () => {
                                    this.scene.tweens.add({
                                        targets: this.targetBall,
                                        scale: 0,
                                        alpha: 0,
                                        duration: 200
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    }

    private triggerTankFire(isSuccess: boolean) {
        if (!this.playerTank || !this.enemyTank) return;
        this.audioManager.playBossHit();

        const shell = this.scene.add.circle(this.playerTank.x, this.playerTank.y - 20, 6, 0xfacc15);
        this.simContainer.add(shell);

        this.scene.tweens.add({
            targets: shell,
            x: this.enemyTank.x,
            y: this.enemyTank.y,
            duration: 280,
            onComplete: () => {
                shell.destroy();
                if (isSuccess) {
                    this.audioManager.playBossDefeat();
                    const blast = this.scene.add.circle(this.enemyTank!.x, this.enemyTank!.y, 36, 0xef4444, 0.85);
                    this.simContainer.add(blast);

                    this.scene.tweens.add({
                        targets: [blast, this.enemyTank],
                        scale: 1.5,
                        alpha: 0,
                        duration: 350,
                        onComplete: () => blast.destroy()
                    });
                }
            }
        });
    }

    private handleMiniGameSuccess() {
        this.audioManager.playCompileSuccess();
        this.statusText.setText('🎉 SCRATCH PASS (200 OK)! 스크래치 알고리즘 100점 만점!');
        this.statusText.setColor('#4ade80');

        // Scratch Celebration Banner
        const banner = this.scene.add.container(0, 0);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0f172a, 0.96);
        bg.lineStyle(3, 0x22c55e);
        bg.fillRoundedRect(-250, -52, 500, 104, 16);
        bg.strokeRoundedRect(-250, -52, 500, 104, 16);

        const title = this.scene.add.text(0, -18, '✨ 스크래치 알고리즘 PASS! 멘탈 완전 회복! ✨', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '20px',
            color: '#4ade80'
        }).setOrigin(0.5);

        const sub = this.scene.add.text(0, 18, '🪙 코인 +30개 · 점수 +5,000점 · 7초 무적 골든 피버 발동!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#facc15'
        }).setOrigin(0.5);

        banner.add([bg, title, sub]);
        banner.setScale(0);
        this.container.add(banner);

        this.scene.tweens.add({
            targets: banner,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(1600, () => {
                    this.finishMiniGame(5000, 30);
                });
            }
        });
    }

    private handleMiniGameFail(msg: string) {
        this.audioManager.playCompileFail();
        this.statusText.setText(msg);
        this.statusText.setColor('#f87171');
        this.isSimulating = false;
        if (this.cueStick) this.cueStick.setVisible(true);
    }

    private finishMiniGame(scoreBonus: number, coinBonus: number) {
        this.scene.tweens.add({
            targets: this.container,
            scale: 0.8,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                this.container.destroy();
                this.onComplete(scoreBonus, coinBonus);
            }
        });
    }

    // Helper: Standard Button
    private createButton(x: number, y: number, w: number, h: number, text: string, color: number, onClick: () => void) {
        const c = this.scene.add.container(x, y);
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 0.9);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);

        const label = this.scene.add.text(0, 0, text, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#ffffff'
        }).setOrigin(0.5);

        c.add([bg, label]);
        c.setSize(w, h);
        c.setInteractive({ useHandCursor: true });

        c.on('pointerdown', onClick);
        return c;
    }

    // Helper: Scratch Big Run Button (Green Flag)
    private createScratchRunButton(x: number, y: number, w: number, h: number, text: string, onClick: () => void) {
        const c = this.scene.add.container(x, y);
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x16a34a, 1);
        bg.lineStyle(2, 0x4ade80);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

        const label = this.scene.add.text(0, 0, text, {
            fontFamily: '"Black Han Sans", "Permanent Marker", sans-serif',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        c.add([bg, label]);
        c.setSize(w, h);
        c.setInteractive({ useHandCursor: true });

        c.on('pointerover', () => c.setScale(1.02));
        c.on('pointerout', () => c.setScale(1));
        c.on('pointerdown', onClick);

        return c;
    }
}
