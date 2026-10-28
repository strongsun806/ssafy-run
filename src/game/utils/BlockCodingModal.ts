import * as Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export interface BlockItem {
    id: string;
    text: string;
    color: number;
    isCorrect: boolean;
    order: number;
}

export class BlockCodingModal {
    private scene: Phaser.Scene;
    private type: 'iltassafy' | 'battlessafy';
    private audioManager: AudioManager;
    private onComplete: (scoreBonus: number, coinBonus: number) => void;

    private container!: Phaser.GameObjects.Container;
    private placedBlocks: BlockItem[] = [];
    private blockWorkspaceContainer!: Phaser.GameObjects.Container;
    private statusText!: Phaser.GameObjects.Text;
    private isSimulating: boolean = false;

    // Simulation visual elements
    private simContainer!: Phaser.GameObjects.Container;
    private cueBall?: Phaser.GameObjects.Arc;
    private targetBall?: Phaser.GameObjects.Arc;
    private obstacleBall?: Phaser.GameObjects.Arc;
    private cueStick?: Phaser.GameObjects.Graphics;

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

    private getAvailableBlocks(): BlockItem[] {
        if (this.type === 'iltassafy') {
            return [
                { id: 'angle', text: '📐 조준 각도: 45°', color: 0x2563eb, isCorrect: true, order: 1 },
                { id: 'cushion', text: '🔄 쿠션 반사 연산', color: 0x9333ea, isCorrect: true, order: 2 },
                { id: 'power', text: '⚡ 타구 파워: 80%', color: 0xea580c, isCorrect: true, order: 3 },
                { id: 'shoot', text: '🎱 큐대 샷 발사!', color: 0x16a34a, isCorrect: true, order: 4 },
                { id: 'wrong_angle', text: '❌ 역방향 180° 조준', color: 0x475569, isCorrect: false, order: 99 },
                { id: 'wrong_power', text: '⚠️ 파워 10% (너무 약함)', color: 0x475569, isCorrect: false, order: 99 }
            ];
        } else {
            return [
                { id: 'move', text: '🚀 전진 2칸 이동', color: 0x2563eb, isCorrect: true, order: 1 },
                { id: 'turn', text: '🔄 포탑 우회전 90°', color: 0xea580c, isCorrect: true, order: 2 },
                { id: 'radar', text: '📡 적 레이더 락온', color: 0x9333ea, isCorrect: true, order: 3 },
                { id: 'fire', text: '💥 주포 철갑탄 발사!', color: 0x16a34a, isCorrect: true, order: 4 },
                { id: 'wrong_back', text: '⚡ 후진 3칸 (추락 위험)', color: 0x475569, isCorrect: false, order: 99 },
                { id: 'wrong_stop', text: '🛑 엔진 정지 (무방비)', color: 0x475569, isCorrect: false, order: 99 }
            ];
        }
    }

    private createModal() {
        const { width, height } = this.scene.scale;
        this.container = this.scene.add.container(width / 2, height / 2).setDepth(300);

        // Dim background overlay
        const dim = this.scene.add.graphics();
        dim.fillStyle(0x000000, 0.85);
        dim.fillRect(-width / 2, -height / 2, width, height);
        dim.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
        this.container.add(dim);

        // Modal Frame
        const cardW = 1040;
        const cardH = 580;
        const frame = this.scene.add.graphics();
        frame.fillStyle(0x090f1d, 0.98);
        frame.lineStyle(2, 0x38bdf8);
        frame.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        frame.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        this.container.add(frame);

        // Top Header
        const badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x0284c7, 0.4);
        badgeBg.lineStyle(1, 0x38bdf8);
        badgeBg.fillRoundedRect(-160, -cardH / 2 + 16, 320, 24, 12);
        badgeBg.strokeRoundedRect(-160, -cardH / 2 + 16, 320, 24, 12);

        const badgeText = this.scene.add.text(0, -cardH / 2 + 28, '🧩 SSAFY BREAK TIME · 쉬어가는 블록코딩', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const titleText = this.type === 'iltassafy'
            ? '🎱 일타싸피 평가: 목적구 포켓인 알고리즘'
            : '⚔️ 배틀싸피 평가: 적 전차 격파 알고리즘';

        const title = this.scene.add.text(0, -cardH / 2 + 62, titleText, {
            fontFamily: '"Black Han Sans", "Permanent Marker", sans-serif',
            fontSize: '25px',
            color: '#facc15'
        }).setOrigin(0.5);

        const subText = this.type === 'iltassafy'
            ? '손가락을 잠시 쉬어가세요! 🧠 블록을 조립하여 당구공을 포켓에 넣고 멘탈을 100% 회복하세요!'
            : '손가락을 잠시 쉬어가세요! 🧠 블록을 조립하여 사이버 적 전차를 격파하고 멘탈을 100% 회복하세요!';

        const subtitle = this.scene.add.text(0, -cardH / 2 + 94, subText, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Fast Skip Button (Top Right)
        const skipBtn = this.createButton(cardW / 2 - 80, -cardH / 2 + 35, 110, 34, '⚡ 즉시 패스', 0x334155, () => {
            this.finishMiniGame(3000, 15);
        });

        this.container.add([badgeBg, badgeText, title, subtitle, skipBtn]);

        // Left Panel: Simulation Area
        this.createSimulationPanel(-cardW / 2 + 25, -cardH / 2 + 120, 460, 340);

        // Right Panel: Block Coding IDE
        this.createCodingIdePanel(20, -cardH / 2 + 120, 475, 420);

        // Entrance animation
        this.container.setScale(0.8);
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 320,
            ease: 'Back.easeOut'
        });
    }

    // --- Simulation Viewport ---
    private createSimulationPanel(x: number, y: number, w: number, h: number) {
        this.simContainer = this.scene.add.container(x, y);
        this.container.add(this.simContainer);

        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0x0f172a, 0.9);
        panelBg.lineStyle(1, 0x334155);
        panelBg.fillRoundedRect(0, 0, w, h, 14);
        panelBg.strokeRoundedRect(0, 0, w, h, 14);
        this.simContainer.add(panelBg);

        const label = this.scene.add.text(15, 12, '📺 ALGORITHM SIMULATION VIEW', {
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

    // Billiards Simulation Scene
    private setupBilliardsSim(w: number, h: number) {
        // Table Felt
        const felt = this.scene.add.graphics();
        felt.fillStyle(0x065f46, 1);
        felt.lineStyle(8, 0x78350f);
        felt.fillRoundedRect(20, 36, w - 40, h - 56, 16);
        felt.strokeRoundedRect(20, 36, w - 40, h - 56, 16);
        this.simContainer.add(felt);

        // Pockets (6 holes)
        const pocketCoords = [
            { x: 34, y: 50 }, { x: w / 2, y: 44 }, { x: w - 34, y: 50 },
            { x: 34, y: h - 34 }, { x: w / 2, y: h - 28 }, { x: w - 34, y: h - 34 }
        ];

        pocketCoords.forEach(p => {
            const hole = this.scene.add.circle(p.x, p.y, 14, 0x020617);
            const holeBorder = this.scene.add.circle(p.x, p.y, 14).setStrokeStyle(2, 0x334155);
            this.simContainer.add([hole, holeBorder]);
        });

        // Target Pocket Indicator (Top-Right Hole)
        const targetHole = pocketCoords[2];
        const targetRing = this.scene.add.circle(targetHole.x, targetHole.y, 22).setStrokeStyle(2, 0xfacc15);
        const goalBadge = this.scene.add.text(targetHole.x - 30, targetHole.y + 18, '🎯 GOAL', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '12px',
            color: '#facc15'
        });
        this.simContainer.add([targetRing, goalBadge]);

        this.scene.tweens.add({
            targets: targetRing,
            scale: 1.25,
            alpha: 0.5,
            yoyo: true,
            repeat: -1,
            duration: 600
        });

        // Obstacle Ball (Yellow)
        this.obstacleBall = this.scene.add.circle(220, 160, 11, 0xeab308);
        this.obstacleBall.setStrokeStyle(1.5, 0x713f12);

        // Target Ball (Red)
        this.targetBall = this.scene.add.circle(260, 120, 11, 0xef4444);
        this.targetBall.setStrokeStyle(1.5, 0x7f1d1d);

        // Cue Ball (White)
        this.cueBall = this.scene.add.circle(90, 230, 11, 0xf8fafc);
        this.cueBall.setStrokeStyle(1.5, 0x94a3b8);

        // Cue Stick
        this.cueStick = this.scene.add.graphics();
        this.drawCueStick(90, 230, 45);

        this.simContainer.add([this.obstacleBall, this.targetBall, this.cueBall, this.cueStick]);
    }

    private drawCueStick(ballX: number, ballY: number, angleDeg: number) {
        if (!this.cueStick) return;
        this.cueStick.clear();

        const rad = Phaser.Math.DegToRad(angleDeg + 180);
        const startX = ballX + Math.cos(rad) * 20;
        const startY = ballY + Math.sin(rad) * 20;
        const endX = ballX + Math.cos(rad) * 110;
        const endY = ballY + Math.sin(rad) * 110;

        this.cueStick.lineStyle(5, 0xd97706);
        this.cueStick.lineBetween(startX, startY, endX, endY);
        this.cueStick.fillStyle(0xf8fafc);
        this.cueStick.fillCircle(startX, startY, 3);
    }

    // Tank Simulation Scene
    private setupTankSim(w: number, h: number) {
        // Arena Grid
        const gridG = this.scene.add.graphics();
        gridG.fillStyle(0x0a101f, 1);
        gridG.lineStyle(1, 0x1e293b);
        gridG.fillRoundedRect(20, 36, w - 40, h - 56, 12);
        gridG.strokeRoundedRect(20, 36, w - 40, h - 56, 12);

        // Draw tactical grid lines
        for (let gx = 80; gx < w - 40; gx += 60) {
            gridG.lineBetween(gx, 36, gx, h - 20);
        }
        for (let gy = 80; gy < h - 20; gy += 60) {
            gridG.lineBetween(20, gy, w - 20, gy);
        }
        this.simContainer.add(gridG);

        // Barricade Obstacles
        const barrier1 = this.scene.add.rectangle(200, 160, 40, 50, 0x475569);
        barrier1.setStrokeStyle(2, 0x64748b);
        const barrier2 = this.scene.add.rectangle(200, 220, 40, 50, 0x475569);
        barrier2.setStrokeStyle(2, 0x64748b);
        this.simContainer.add([barrier1, barrier2]);

        // Player Cyber Tank (Bottom Left)
        this.playerTank = this.scene.add.container(70, 240);
        const tankBody = this.scene.add.rectangle(0, 0, 36, 26, 0x0284c7);
        tankBody.setStrokeStyle(2, 0x38bdf8);
        const turret = this.scene.add.circle(0, 0, 9, 0x0369a1);
        const barrel = this.scene.add.rectangle(14, 0, 16, 5, 0x38bdf8);
        this.playerTank.add([tankBody, turret, barrel]);
        this.simContainer.add(this.playerTank);

        // Enemy Boss Tank (Top Right)
        this.enemyTank = this.scene.add.container(360, 90);
        const enemyBody = this.scene.add.rectangle(0, 0, 42, 32, 0xb91c1c);
        enemyBody.setStrokeStyle(2, 0xef4444);
        const enemyTurret = this.scene.add.circle(0, 0, 11, 0x991b1b);
        const enemyBarrel = this.scene.add.rectangle(-18, 0, 18, 6, 0xef4444);
        const bossTag = this.scene.add.text(0, -28, '적 보스 AI', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '11px',
            color: '#ef4444'
        }).setOrigin(0.5);
        this.enemyTank.add([enemyBody, enemyTurret, enemyBarrel, bossTag]);
        this.simContainer.add(this.enemyTank);
    }

    // --- Block Coding Workspace Panel ---
    private createCodingIdePanel(x: number, y: number, w: number, h: number) {
        const ideContainer = this.scene.add.container(x, y);
        this.container.add(ideContainer);

        // Block Palette Header
        const paletteTitle = this.scene.add.text(0, 0, '📦 사용 가능한 블록 (클릭하여 추가)', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#38bdf8'
        });
        ideContainer.add(paletteTitle);

        // Blocks Palette (2 columns x 3 rows)
        const blocks = this.getAvailableBlocks();
        blocks.forEach((blk, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const bx = col * 235;
            const by = 28 + row * 40;

            const btn = this.createBlockChip(bx, by, 225, 34, blk.text, blk.color, () => {
                this.addBlockToWorkspace(blk);
            });
            ideContainer.add(btn);
        });

        // Workspace Script Stack Section
        const wsY = 160;
        const wsTitle = this.scene.add.text(0, wsY, '📜 내 알고리즘 스택 (클릭 시 블록 제거)', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#facc15'
        });

        // Quick Auto-fill button (Comfort / Accessibility)
        const autoFillBtn = this.createButton(335, wsY + 8, 130, 26, '💡 정답 자동배치', 0x059669, () => {
            this.autoFillCorrectBlocks();
        });

        // Reset button
        const resetBtn = this.createButton(435, wsY + 8, 65, 26, '↺ 초기화', 0x475569, () => {
            this.placedBlocks = [];
            this.renderWorkspaceBlocks();
            this.audioManager.playBlockClick();
        });

        ideContainer.add([wsTitle, autoFillBtn, resetBtn]);

        // Workspace Box Background
        const wsBox = this.scene.add.graphics();
        wsBox.fillStyle(0x020617, 0.95);
        wsBox.lineStyle(1.5, 0x1e293b);
        wsBox.fillRoundedRect(0, wsY + 28, w, 140, 10);
        wsBox.strokeRoundedRect(0, wsY + 28, w, 140, 10);
        ideContainer.add(wsBox);

        // Workspace Inner Container for dynamically rendered blocks
        this.blockWorkspaceContainer = this.scene.add.container(10, wsY + 38);
        ideContainer.add(this.blockWorkspaceContainer);
        this.renderWorkspaceBlocks();

        // Status Feedback Text
        this.statusText = this.scene.add.text(w / 2, wsY + 185, '💡 올바른 블록을 순서대로 조립한 후 실행 버튼을 누르세요!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        ideContainer.add(this.statusText);

        // Big Run Button
        const runBtn = this.createRunButton(w / 2, wsY + 225, w - 20, 48, '▶ 알고리즘 컴파일 & 실행 (Run Code)', () => {
            this.executeAlgorithm();
        });
        ideContainer.add(runBtn);
    }

    private addBlockToWorkspace(blk: BlockItem) {
        if (this.isSimulating) return;
        if (this.placedBlocks.length >= 6) {
            this.statusText.setText('⚠️ 알고리즘 스택이 가득 찼습니다! (최대 6개)');
            this.statusText.setColor('#f87171');
            return;
        }

        this.placedBlocks.push(blk);
        this.audioManager.playBlockClick();
        this.renderWorkspaceBlocks();
        this.statusText.setText(`블록 추가됨: ${blk.text}`);
        this.statusText.setColor('#38bdf8');
    }

    private autoFillCorrectBlocks() {
        if (this.isSimulating) return;
        const corrects = this.getAvailableBlocks()
            .filter(b => b.isCorrect)
            .sort((a, b) => a.order - b.order);

        this.placedBlocks = [...corrects];
        this.audioManager.playBlockClick();
        this.renderWorkspaceBlocks();
        this.statusText.setText('✨ 정답 블록들이 알맞게 배치되었습니다! [실행 버튼]을 누르세요!');
        this.statusText.setColor('#4ade80');
    }

    private renderWorkspaceBlocks() {
        this.blockWorkspaceContainer.removeAll(true);

        if (this.placedBlocks.length === 0) {
            const emptyLabel = this.scene.add.text(210, 55, '(위 블록을 클릭하여 알고리즘을 조립하세요)', {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '14px',
                color: '#475569'
            }).setOrigin(0.5);
            this.blockWorkspaceContainer.add(emptyLabel);
            return;
        }

        // Render placed blocks sequentially
        this.placedBlocks.forEach((blk, idx) => {
            const bx = (idx % 2) * 230;
            const by = Math.floor(idx / 2) * 38;

            const chip = this.scene.add.container(bx, by);
            const chipBg = this.scene.add.graphics();
            chipBg.fillStyle(blk.color, 0.9);
            chipBg.lineStyle(1, 0xffffff, 0.4);
            chipBg.fillRoundedRect(0, 0, 220, 32, 8);
            chipBg.strokeRoundedRect(0, 0, 220, 32, 8);

            const num = this.scene.add.text(10, 16, `${idx + 1}.`, {
                fontFamily: '"Impact", sans-serif',
                fontSize: '13px',
                color: '#facc15'
            }).setOrigin(0, 0.5);

            const title = this.scene.add.text(28, 16, blk.text, {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '12px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            const removeIcon = this.scene.add.text(205, 16, '✕', {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#cbd5e1'
            }).setOrigin(0.5);

            chip.add([chipBg, num, title, removeIcon]);
            chip.setSize(220, 32);
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

    // --- Algorithm Execution & Validation ---
    private executeAlgorithm() {
        if (this.isSimulating) return;

        if (this.placedBlocks.length === 0) {
            this.statusText.setText('⚠️ 실행할 블록이 없습니다. 블록을 먼저 추가하세요!');
            this.statusText.setColor('#f87171');
            this.audioManager.playCompileFail();
            return;
        }

        this.isSimulating = true;
        this.statusText.setText('⚙️ 알고리즘 컴파일 및 시뮬레이션 연산 중...');
        this.statusText.setColor('#38bdf8');

        // Check if all correct blocks are present and no incorrect ones exist
        const hasWrongBlock = this.placedBlocks.some(b => !b.isCorrect);
        const correctIds = this.getAvailableBlocks().filter(b => b.isCorrect).map(b => b.id);
        const placedIds = this.placedBlocks.map(b => b.id);
        const hasAllCorrects = correctIds.every(id => placedIds.includes(id));

        const isSuccess = !hasWrongBlock && hasAllCorrects;

        if (this.type === 'iltassafy') {
            this.runBilliardsSimulation(isSuccess);
        } else {
            this.runTankSimulation(isSuccess);
        }
    }

    private runBilliardsSimulation(isSuccess: boolean) {
        if (!this.cueBall || !this.targetBall || !this.cueStick) return;

        // 1. Cue Stick Strike
        this.scene.tweens.add({
            targets: this.cueStick,
            x: -15,
            y: -15,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.audioManager.playHit();
                this.cueStick?.setVisible(false);

                if (isSuccess) {
                    // Success Path: Cue Ball banks off cushion and pots the red ball
                    this.scene.tweens.add({
                        targets: this.cueBall,
                        x: 230,
                        y: 150,
                        duration: 350,
                        ease: 'Cubic.easeOut',
                        onComplete: () => {
                            this.audioManager.playHit();
                            // Red ball rolls into the target top-right pocket
                            this.scene.tweens.add({
                                targets: this.targetBall,
                                x: 426,
                                y: 50,
                                duration: 450,
                                ease: 'Cubic.easeOut',
                                onComplete: () => {
                                    // Pocket drop animation
                                    this.scene.tweens.add({
                                        targets: this.targetBall,
                                        scale: 0,
                                        alpha: 0,
                                        duration: 200,
                                        onComplete: () => {
                                            this.handleMiniGameSuccess();
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    // Fail Path: Ball rolls weakly or misses
                    this.scene.tweens.add({
                        targets: this.cueBall,
                        x: 140,
                        y: 200,
                        duration: 350,
                        ease: 'Cubic.easeOut',
                        onComplete: () => {
                            this.handleMiniGameFail('❌ 런타임 에러: 목적구에 도달하지 못했습니다! [💡 정답 자동배치]를 활용해보세요.');
                        }
                    });
                }
            }
        });
    }

    private runTankSimulation(isSuccess: boolean) {
        if (!this.playerTank || !this.enemyTank) return;

        if (isSuccess) {
            // Step 1: Tank moves forward 2 tiles
            this.scene.tweens.add({
                targets: this.playerTank,
                x: 180,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    // Step 2: Tank rotates 90 degrees up
                    this.scene.tweens.add({
                        targets: this.playerTank,
                        angle: -90,
                        duration: 250,
                        onComplete: () => {
                            // Step 3: Fire Cannon
                            this.audioManager.playBossHit();
                            const shell = this.scene.add.circle(this.playerTank!.x, this.playerTank!.y - 20, 6, 0xfacc15);
                            this.simContainer.add(shell);

                            this.scene.tweens.add({
                                targets: shell,
                                x: this.enemyTank!.x,
                                y: this.enemyTank!.y,
                                duration: 300,
                                onComplete: () => {
                                    shell.destroy();
                                    this.audioManager.playBossDefeat();

                                    // Explosion rings on enemy tank
                                    const blast = this.scene.add.circle(this.enemyTank!.x, this.enemyTank!.y, 35, 0xef4444, 0.8);
                                    this.simContainer.add(blast);

                                    this.scene.tweens.add({
                                        targets: [blast, this.enemyTank],
                                        scale: 1.5,
                                        alpha: 0,
                                        duration: 350,
                                        onComplete: () => {
                                            blast.destroy();
                                            this.handleMiniGameSuccess();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            // Fail Path: Tank moves 1 tile and halts
            this.scene.tweens.add({
                targets: this.playerTank,
                x: 120,
                duration: 300,
                onComplete: () => {
                    this.handleMiniGameFail('❌ 사거리 부족: 장애물에 막혀 적 전차를 타격하지 못했습니다! [💡 정답 자동배치]를 활용해보세요.');
                }
            });
        }
    }

    private handleMiniGameSuccess() {
        this.audioManager.playCompileSuccess();
        this.statusText.setText('🎉 COMPILER PASS (200 OK)! 알고리즘 100점 만점!');
        this.statusText.setColor('#4ade80');

        // Victory Banner popup
        const winBanner = this.scene.add.container(0, 0);
        const winBg = this.scene.add.graphics();
        winBg.fillStyle(0x0f172a, 0.95);
        winBg.lineStyle(3, 0x22c55e);
        winBg.fillRoundedRect(-240, -50, 480, 100, 16);
        winBg.strokeRoundedRect(-240, -50, 480, 100, 16);

        const winTitle = this.scene.add.text(0, -18, '✨ 알고리즘 PASS! 멘탈 100% 완전 회복! ✨', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '20px',
            color: '#4ade80'
        }).setOrigin(0.5);

        const winSub = this.scene.add.text(0, 18, '🪙 코인 +30개 · 점수 +5,000점 · 7초 골든 피버 발동!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#facc15'
        }).setOrigin(0.5);

        winBanner.add([winBg, winTitle, winSub]);
        winBanner.setScale(0);
        this.container.add(winBanner);

        this.scene.tweens.add({
            targets: winBanner,
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

        // Reset cue stick visibility
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

    // Helper: Block Chip Button
    private createBlockChip(x: number, y: number, w: number, h: number, text: string, color: number, onClick: () => void) {
        const c = this.scene.add.container(x, y);
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 0.85);
        bg.lineStyle(1, 0xffffff, 0.3);
        bg.fillRoundedRect(0, 0, w, h, 8);
        bg.strokeRoundedRect(0, 0, w, h, 8);

        const label = this.scene.add.text(w / 2, h / 2, text, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#ffffff'
        }).setOrigin(0.5);

        c.add([bg, label]);
        c.setSize(w, h);
        c.setInteractive({ useHandCursor: true });

        c.on('pointerover', () => bg.setAlpha(1));
        c.on('pointerout', () => bg.setAlpha(0.85));
        c.on('pointerdown', onClick);

        return c;
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

    // Helper: Big Run Button
    private createRunButton(x: number, y: number, w: number, h: number, text: string, onClick: () => void) {
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
