import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager } from '../utils/ScoreManager';
import { SkinManager } from '../utils/SkinManager';
import { StageManager, StageConfig } from '../utils/StageManager';
import { BlockCodingModal } from '../utils/BlockCodingModal';
import { UpgradeManager } from '../utils/UpgradeManager';

interface GroundSegment {
    tile: Phaser.GameObjects.TileSprite;
    body: Phaser.GameObjects.Rectangle;
    x: number;
    width: number;
    leftCap?: Phaser.GameObjects.Image;
    rightCap?: Phaser.GameObjects.Image;
    pitHazard?: Phaser.GameObjects.TileSprite;
    pitWarning?: Phaser.GameObjects.Text;
}

export class Game extends Scene {
    private player!: Player;
    
    // Parallax layers
    private bgFarTile!: Phaser.GameObjects.TileSprite;
    private bgNearTile!: Phaser.GameObjects.TileSprite;

    // Ground segments (Supports Pits & Gaps)
    private groundSegments: GroundSegment[] = [];
    private groundColliderGroup!: Phaser.Physics.Arcade.Group;
    private floatingPlatforms!: Phaser.Physics.Arcade.Group;

    // Object groups
    private obstacles!: Phaser.Physics.Arcade.Group;
    private jellies!: Phaser.Physics.Arcade.Group;
    private items!: Phaser.Physics.Arcade.Group;

    private groundY: number = 0;
    private baseSpeed: number = 400;
    private currentSpeed: number = 400;
    private maxSpeed: number = 620;
    private distance: number = 0;
    private lastPitDistance: number = 0;

    // Current Stage (1, 2, 3)
    private currentStage: number = 1;
    private stageTransitioning: boolean = false;
    private stageBanner?: Phaser.GameObjects.Container;

    // Mental HP
    private maxHp: number = 100;
    private currentHp: number = 100;
    private hpBarFill!: Phaser.GameObjects.Graphics;
    private hpDrainRate: number = 2.0;

    // Score & Currency
    public score: number = 0;
    private highScore: number = 0;
    private combo: number = 0;
    private coinsCollected: number = 0;
    private commitCount: number = 0;
    private qrCount: number = 0;
    private coffeeCount: number = 0;

    // Fever Mode
    private isFeverActive: boolean = false;
    private feverTimeRemaining: number = 0;
    private feverBar!: Phaser.GameObjects.Graphics;
    private feverText!: Phaser.GameObjects.Text;

    // Boss Encounter System (일타싸피, 배틀싸피)
    private isBossActive: boolean = false;
    private currentBossType: 'iltassafy' | 'battlessafy' | null = null;
    private bossSprite?: Phaser.Physics.Arcade.Sprite;
    private bossHp: number = 0;
    private bossMaxHp: number = 100;
    private bossHpContainer?: Phaser.GameObjects.Container;
    private bossHpFill?: Phaser.GameObjects.Graphics;
    private bossHpText?: Phaser.GameObjects.Text;
    private bossAttackTimer: number = 0;
    private bossPatchTimer: number = 0;
    private bossProjectiles!: Phaser.Physics.Arcade.Group;
    private bossPatches!: Phaser.Physics.Arcade.Group;
    private bossDefeatedList: Set<string> = new Set();

    // HUD Elements
    private scoreText!: Phaser.GameObjects.Text;
    private coinText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private hpText!: Phaser.GameObjects.Text;
    private magnetHudText!: Phaser.GameObjects.Text;

    // Wave & Obstacle Generation
    private nextWaveTimer: number = 0;
    private lastPatternIndex: number = -1;

    // Pause & Audio
    private isPaused: boolean = false;
    private pauseContainer?: Phaser.GameObjects.Container;
    private audioManager: AudioManager;

    // Mobile Visual Buttons
    private jumpBtn?: Phaser.GameObjects.Image;
    private slideBtn?: Phaser.GameObjects.Image;

    // Stage Mode Fields (1~30 단계 모드)
    private gameMode: 'infinite' | 'stage' = 'infinite';
    private currentStageId: number = 1;
    private targetDistance: number = 0;
    private isStageCleared: boolean = false;
    private finishGate?: Phaser.Physics.Arcade.Sprite;
    private stageProgressBar?: Phaser.GameObjects.Graphics;
    private stageGoalText?: Phaser.GameObjects.Text;
    private currentStageConfig?: StageConfig;
    private stageClearContainer?: Phaser.GameObjects.Container;

    // v1.6 Cyber Tech Lab & Hyper Arcade Systems
    private droneAssistTimer: number = 0;
    private scoreBonusMultiplier: number = 1;
    private collectedLetters: boolean[] = [false, false, false, false, false];
    private letterHudTexts: Phaser.GameObjects.Text[] = [];
    private dashHudText?: Phaser.GameObjects.Text;
    private waveCount: number = 0;

    constructor() {
        super('Game');
        this.audioManager = AudioManager.getInstance();
    }

    init(data?: { mode?: 'infinite' | 'stage'; stageId?: number }) {
        this.gameMode = data?.mode || 'infinite';
        this.currentStageId = data?.stageId || 1;
        this.isStageCleared = false;
        this.finishGate = undefined;
        this.stageClearContainer = undefined;
    }

    create() {
        const { width, height } = this.scale;

        // Load stage config if in stage mode
        if (this.gameMode === 'stage') {
            this.currentStageConfig = StageManager.getStageConfig(this.currentStageId);
            this.baseSpeed = this.currentStageConfig.baseSpeed;
            this.targetDistance = this.currentStageConfig.targetDistance;
            this.currentStage = this.currentStageConfig.themeStage;
        } else {
            this.baseSpeed = 400;
            this.targetDistance = 0;
            this.currentStage = 1;
            this.currentStageConfig = undefined;
        }

        // Reset game state (Apply RPG Tech Lab Upgrades if enabled)
        const rpgEnabled = UpgradeManager.isRpgTechEnabled();
        this.maxHp = rpgEnabled ? UpgradeManager.getMaxHp() : 100;
        this.currentHp = this.maxHp;
        this.scoreBonusMultiplier = rpgEnabled ? UpgradeManager.getScoreMultiplier() : 1;
        this.droneAssistTimer = rpgEnabled ? UpgradeManager.getDroneCooldownSec() : 9999;
        this.collectedLetters = [false, false, false, false, false];
        this.letterHudTexts = [];
        this.waveCount = 0;

        this.currentSpeed = this.baseSpeed;
        this.distance = 0;
        this.score = 0;
        this.combo = 0;
        this.coinsCollected = 0;
        this.commitCount = 0;
        this.qrCount = 0;
        this.coffeeCount = 0;
        this.stageTransitioning = false;
        this.isFeverActive = false;
        this.feverTimeRemaining = 0;
        this.isPaused = false;
        this.maxSpeed = 620;
        this.hpDrainRate = this.gameMode === 'stage' ? 2.4 + (this.currentStageId * 0.06) : 2.4;
        this.nextWaveTimer = 150;
        this.highScore = ScoreManager.getHighScore();

        // Reset Boss State
        this.isBossActive = false;
        this.currentBossType = null;
        this.bossDefeatedList.clear();

        this.groundY = height - 75;
        this.lastPitDistance = 0;

        // 1. Calm Eye-Comfort Sky & Subtle Background Silhouettes
        this.add.graphics()
            .fillGradientStyle(0x0b1120, 0x0b1120, 0x111827, 0x111827, 1)
            .fillRect(0, 0, width, height);

        this.bgFarTile = this.add.tileSprite(0, height - 350, width, 400, `bg_s${this.currentStage}_far`)
            .setOrigin(0, 0)
            .setAlpha(0.25);

        this.bgNearTile = this.add.tileSprite(0, height - 230, width, 280, `bg_s${this.currentStage}_near`)
            .setOrigin(0, 0)
            .setAlpha(0.32);

        // 2. Segmented Ground & Platforms
        this.groundColliderGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        this.floatingPlatforms = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        this.initGroundSegments();

        // 3. Player with Equipped Skin
        this.player = new Player(this, 180, this.groundY, this.groundY).setDepth(20);
        if (UpgradeManager.isRpgTechEnabled() && UpgradeManager.getLevels().drone >= 2) {
            this.player.activateShield();
        }
        this.events.off('request-hyper-dash');
        this.events.on('request-hyper-dash', () => {
            if (UpgradeManager.isArcadeDashEnabled()) {
                this.player.triggerHyperDash(true);
            }
        });
        this.physics.add.collider(this.player, this.groundColliderGroup, () => {
            if (this.player.body && (this.player.body.blocked.down || this.player.body.touching.down)) {
                this.player.resetJump();
            }
        });
        this.physics.add.collider(this.player, this.floatingPlatforms, () => {
            if (this.player.body && (this.player.body.blocked.down || this.player.body.touching.down)) {
                this.player.resetJump();
            }
        });

        // 4. Object Groups
        this.obstacles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.obstacles, (_p, obs) => {
            this.handleHitObstacle(obs as Phaser.Physics.Arcade.Sprite);
        });

        this.jellies = this.physics.add.group();
        this.physics.add.overlap(this.player, this.jellies, (_p, j) => {
            this.collectJelly(j as Phaser.Physics.Arcade.Sprite);
        });

        this.items = this.physics.add.group();
        this.physics.add.overlap(this.player, this.items, (_p, i) => {
            this.collectSpecialItem(i as Phaser.Physics.Arcade.Sprite);
        });

        // Boss Projectiles & Debug Patches
        this.bossProjectiles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.bossProjectiles, (_p, proj) => {
            this.handleHitBossProjectile(proj as Phaser.Physics.Arcade.Sprite);
        });

        this.bossPatches = this.physics.add.group();
        this.physics.add.overlap(this.player, this.bossPatches, (_p, patch) => {
            this.collectDebugPatch(patch as Phaser.Physics.Arcade.Sprite);
        });

        // 5. HUD
        this.createHUD();

        // 6. Split-screen touch controls
        this.setupTouchControls();

        // 7. Keyboard & Browser Back listeners
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-P', () => this.togglePause());
            this.input.keyboard.on('keydown-ESC', () => this.togglePause());
            this.input.keyboard.on('keydown-BACKSPACE', () => {
                this.audioManager.stopBgm();
                this.scene.start('MainMenu');
            });
        }

        window.history.pushState({ scene: 'Game' }, '');
        const onPopState = () => {
            if (this.scene.isActive('Game')) {
                this.audioManager.stopBgm();
                this.scene.start('MainMenu');
            }
        };
        window.addEventListener('popstate', onPopState);
        this.events.once('shutdown', () => {
            window.removeEventListener('popstate', onPopState);
        });

        this.audioManager.startBgm();
    }

    private initGroundSegments() {
        this.groundSegments = [];
        this.spawnGroundSegment(0, 1200, false, false);
    }

    private spawnGroundSegment(startX: number, segWidth: number, hasLeftCap: boolean, hasRightCap: boolean): GroundSegment {
        const groundTex = `ground_s${this.currentStage}`;
        const tile = this.add.tileSprite(startX, this.groundY, segWidth, 75, groundTex)
            .setOrigin(0, 0)
            .setDepth(10);

        const body = this.add.rectangle(startX + segWidth / 2, this.groundY + 37, segWidth, 75, 0x000000, 0);
        this.physics.add.existing(body);
        const physBody = body.body as Phaser.Physics.Arcade.Body;
        if (physBody) {
            physBody.setImmovable(true);
            physBody.setAllowGravity(false);
            physBody.setVelocityX(-this.currentSpeed);
        }
        this.groundColliderGroup.add(body);

        let leftCap: Phaser.GameObjects.Image | undefined;
        let rightCap: Phaser.GameObjects.Image | undefined;

        if (hasLeftCap) {
            leftCap = this.add.image(startX + 14, this.groundY + 37, 'ground_cliff_right')
                .setDepth(11);
        }

        if (hasRightCap) {
            rightCap = this.add.image(startX + segWidth - 14, this.groundY + 37, 'ground_cliff_left')
                .setDepth(11);
        }

        const segment: GroundSegment = {
            tile,
            body,
            x: startX,
            width: segWidth,
            leftCap,
            rightCap
        };

        this.groundSegments.push(segment);
        return segment;
    }

    private spawnPitHazard(pitStartX: number, pitWidth: number): Phaser.GameObjects.TileSprite {
        const pitHazard = this.add.tileSprite(pitStartX, this.groundY, pitWidth, 75, 'pit_hazard')
            .setOrigin(0, 0)
            .setDepth(4);

        // Parabolic arc of 4 gold coins over the pit to guide the player's jump cleanly
        const numCoins = 4;
        for (let i = 0; i < numCoins; i++) {
            const t = (i + 1) / (numCoins + 1);
            const coinX = pitStartX + pitWidth * t;
            const coinY = this.groundY - 25 - Math.sin(t * Math.PI) * 55;
            const coin = this.jellies.create(coinX, coinY, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(coin, 50, 'coin');
        }

        return pitHazard;
    }

    private setupTouchControls() {
        const { width, height } = this.scale;

        if (this.textures.exists('btn_touch_slide')) {
            this.slideBtn = this.add.image(90, height - 90, 'btn_touch_slide')
                .setDepth(60)
                .setAlpha(0.65);
        }

        if (this.textures.exists('btn_touch_jump')) {
            this.jumpBtn = this.add.image(width - 90, height - 90, 'btn_touch_jump')
                .setDepth(60)
                .setAlpha(0.65);
        }

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPaused || this.isStageCleared) return;
            if (pointer.y < 105) return;

            if (pointer.x < width / 2) {
                this.player.setTouchSlide(true);
                this.slideBtn?.setAlpha(0.9).setScale(0.95);
            } else {
                this.player.requestTouchJump();
                this.jumpBtn?.setAlpha(0.9).setScale(0.95);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2) {
                this.player.setTouchSlide(false);
                this.slideBtn?.setAlpha(0.65).setScale(1.0);
            } else {
                this.jumpBtn?.setAlpha(0.65).setScale(1.0);
            }
        });
    }

    update(_time: number, delta: number) {
        if (this.isPaused || this.isStageCleared) return;

        const deltaSec = delta / 1000;

        // Distance & Progressive Speed Scaling (Comfortable 1.35x speed boost during Dash)
        const dashSpeedMult = this.player.isDashing ? 1.35 : 1.0;
        const effectiveSpeed = this.currentSpeed * dashSpeedMult;
        this.distance += (effectiveSpeed * deltaSec) / 14;
        this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + Math.floor(this.distance * 0.18));

        // AI Companion Bit-Drone Autonomous Assist
        if (UpgradeManager.isRpgTechEnabled() && !this.isBossActive) {
            this.droneAssistTimer -= deltaSec;
            if (this.droneAssistTimer <= 0) {
                this.droneAssistTimer = UpgradeManager.getDroneCooldownSec();
                this.triggerDroneAutonomousAssist();
            }
        }

        // Update Hyper Dash HUD status
        if (this.dashHudText && UpgradeManager.isArcadeDashEnabled()) {
            if (this.player.isDashing) {
                this.dashHudText.setText('DASH 작동 중');
                this.dashHudText.setColor('#fde047');
            } else if (this.player.dashCooldownRemaining > 0) {
                this.dashHudText.setText(`DASH 대기: ${this.player.dashCooldownRemaining.toFixed(1)}s`);
                this.dashHudText.setColor('#94a3b8');
            } else {
                this.dashHudText.setText('DASH [Shift] 준비완료');
                this.dashHudText.setColor('#38bdf8');
            }
        }

        // Check Stage Finish Gate in Stage Mode
        if (this.gameMode === 'stage') {
            this.updateStageProgressHUD();
            if (this.distance >= this.targetDistance - 25 && !this.finishGate) {
                this.spawnFinishGate();
            }
        }

        // Very gentle background drift (Prevents eye fatigue & motion sickness)
        if (this.bgFarTile) this.bgFarTile.tilePositionX += (this.currentSpeed * 0.008) * deltaSec;
        if (this.bgNearTile) this.bgNearTile.tilePositionX += (this.currentSpeed * 0.018) * deltaSec;

        // Ground segments scrolling & pit management
        this.updateGroundSegments(deltaSec);

        // Check for falling into pit / hole
        if (this.player.y > this.groundY + 45 && !this.player.isRescuing) {
            this.handleFallIntoPit();
        }

        // Check Stage Transitions (Stage 1 -> Stage 2 -> Stage 3)
        this.checkStageProgression();

        // Check Boss Encounters
        this.checkBossProgression();

        // Mental HP natural decay
        this.currentHp -= this.hpDrainRate * deltaSec;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
            return;
        }
        this.renderHpBar();

        // Fever mode duration decay
        if (this.isFeverActive) {
            this.feverTimeRemaining -= deltaSec;
            this.renderFeverBar();
            if (this.feverTimeRemaining <= 0) {
                this.endFeverMode();
            }
        }

        // Magnet HUD indicator
        if (this.player.magnetTimeRemaining > 0) {
            this.magnetHudText.setVisible(true);
            this.magnetHudText.setText(`MAGNET: ${this.player.magnetTimeRemaining.toFixed(1)}s`);
        } else {
            this.magnetHudText.setVisible(false);
        }

        // Wave generator
        if (this.isBossActive) {
            this.updateBoss(deltaSec, delta);
        } else {
            this.nextWaveTimer -= delta;
            if (this.nextWaveTimer <= 0) {
                this.spawnNextWave();
            }
        }

        // Player update
        this.player.update(_time, delta);

        // Temporary Magnet Attraction
        if (this.player.magnetTimeRemaining > 0 || this.isFeverActive) {
            this.applyMagneticAttraction();
        }

        // Update HUD
        this.distanceText.setText(`${Math.floor(this.distance)}m`);
        this.coinText.setText(`${this.coinsCollected} G`);

        // Clean off-screen objects
        this.cleanOffscreen(this.obstacles);
        this.cleanOffscreen(this.jellies);
        this.cleanOffscreen(this.items);
        this.cleanOffscreen(this.floatingPlatforms);
        this.cleanOffscreen(this.bossProjectiles);
        this.cleanOffscreen(this.bossPatches);
    }

    private updateGroundSegments(deltaSec: number) {
        const { width } = this.scale;
        const shift = this.currentSpeed * deltaSec;

        for (let i = this.groundSegments.length - 1; i >= 0; i--) {
            const seg = this.groundSegments[i];
            seg.x -= shift;
            seg.tile.x = seg.x;
            seg.body.x = seg.x + seg.width / 2;

            const physBody = seg.body.body as Phaser.Physics.Arcade.Body;
            if (physBody) {
                physBody.reset(seg.x + seg.width / 2, this.groundY + 37);
                physBody.setVelocityX(-this.currentSpeed);
            }

            if (seg.leftCap) seg.leftCap.x = seg.x + 14;
            if (seg.rightCap) seg.rightCap.x = seg.x + seg.width - 14;
            if (seg.pitHazard) seg.pitHazard.x -= shift;

            if (seg.x + seg.width < -200) {
                seg.tile.destroy();
                seg.body.destroy();
                if (seg.leftCap) seg.leftCap.destroy();
                if (seg.rightCap) seg.rightCap.destroy();
                if (seg.pitHazard) seg.pitHazard.destroy();
                this.groundSegments.splice(i, 1);
            }
        }

        const lastSeg = this.groundSegments[this.groundSegments.length - 1];
        if (lastSeg && lastSeg.x + lastSeg.width < width + 600) {
            const nextX = lastSeg.x + lastSeg.width;

            const pitChance = this.currentStageConfig ? this.currentStageConfig.pitChance : 0.35;
            const canCreatePit = this.distance >= 35 && (this.distance - this.lastPitDistance) > 55;
            const shouldCreatePit = canCreatePit && Math.random() < pitChance;

            if (shouldCreatePit) {
                this.lastPitDistance = this.distance;
                const extraW = this.gameMode === 'stage' ? Math.min(35, this.currentStageId * 1.2) : 15;
                const pitWidth = Phaser.Math.Between(135, 155 + Math.floor(extraW));
                const segWidth = Phaser.Math.Between(520, 860);

                if (!lastSeg.rightCap) {
                    lastSeg.rightCap = this.add.image(lastSeg.x + lastSeg.width - 14, this.groundY + 37, 'ground_cliff_left').setDepth(11);
                }

                const pitHazard = this.spawnPitHazard(nextX, pitWidth);
                const newSeg = this.spawnGroundSegment(nextX + pitWidth, segWidth, true, false);
                newSeg.pitHazard = pitHazard;
            } else {
                const segWidth = Phaser.Math.Between(600, 950);
                this.spawnGroundSegment(nextX, segWidth, false, false);
            }
        }
    }

    private handleFallIntoPit() {
        this.currentHp -= 45;
        this.combo = 0;
        this.comboText.setText('');

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
            return;
        }

        this.renderHpBar();
        this.ensureGroundUnderPlayer();
        this.player.rescueFromPit(() => {});
    }

    private ensureGroundUnderPlayer() {
        const px = this.player.x;
        let hasGround = false;
        for (const seg of this.groundSegments) {
            if (seg.x <= px + 40 && (seg.x + seg.width) >= px - 40) {
                hasGround = true;
                break;
            }
        }

        if (!hasGround) {
            this.spawnGroundSegment(px - 100, 500, false, false);
        }
    }

    private checkStageProgression() {
        if (this.stageTransitioning || this.gameMode === 'stage') return;

        if (this.currentStage === 1 && this.distance >= 500) {
            this.transitionToStage(2, 'STAGE 2: 비상계단 구간 진입');
        } else if (this.currentStage === 2 && this.distance >= 1100) {
            this.transitionToStage(3, 'STAGE 3: 11층 코딩 랩실 진입');
        }
    }

    private transitionToStage(newStage: number, bannerText: string) {
        this.currentStage = newStage;
        this.stageTransitioning = true;
        this.audioManager.playStageClear();

        if (this.bgFarTile) this.bgFarTile.setTexture(`bg_s${newStage}_far`);
        if (this.bgNearTile) this.bgNearTile.setTexture(`bg_s${newStage}_near`);

        const { width, height } = this.scale;
        this.stageBanner = this.add.container(width / 2, height / 2 - 80).setDepth(150);

        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0x0f172a, 0.95);
        bannerBg.lineStyle(2, 0x38bdf8);
        bannerBg.fillRoundedRect(-260, -30, 520, 60, 12);
        bannerBg.strokeRoundedRect(-260, -30, 520, 60, 12);

        const bannerLbl = this.add.text(0, 0, bannerText, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '20px',
            color: '#facc15'
        }).setOrigin(0.5);

        this.stageBanner.add([bannerBg, bannerLbl]);
        this.time.delayedCall(1500, () => {
            this.stageBanner?.destroy();
            this.stageTransitioning = false;
        });

        this.stageText.setText(`STAGE ${newStage}`);
    }

    private checkBossProgression() {
        if (this.isBossActive) return;

        if (this.gameMode === 'stage') {
            if (this.currentStageConfig?.bossType) {
                const bossDist = this.targetDistance * 0.35;
                if (this.distance >= bossDist && !this.bossDefeatedList.has(this.currentStageConfig.bossType)) {
                    this.startBossEncounter(this.currentStageConfig.bossType);
                }
            }
            return;
        }

        if (this.distance >= 350 && !this.bossDefeatedList.has('iltassafy')) {
            this.startBossEncounter('iltassafy');
        } else if (this.distance >= 850 && !this.bossDefeatedList.has('battlessafy')) {
            this.startBossEncounter('battlessafy');
        }
    }

    private startBossEncounter(type: 'iltassafy' | 'battlessafy') {
        this.isBossActive = true;
        this.currentBossType = type;

        this.audioManager.playBossWarning();

        const { width, height } = this.scale;

        const alertContainer = this.add.container(width / 2, height / 2 - 80).setDepth(200);
        const alertBg = this.add.graphics();
        alertBg.fillStyle(0x0f172a, 0.96);
        alertBg.lineStyle(2, 0x38bdf8);
        alertBg.fillRoundedRect(-300, -45, 600, 90, 14);
        alertBg.strokeRoundedRect(-300, -45, 600, 90, 14);

        const titleText = type === 'iltassafy'
            ? '[인터미션] 일타싸피 알고리즘 평가'
            : '[인터미션] 배틀싸피 알고리즘 평가';

        const alertTitle = this.add.text(0, -14, titleText, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '21px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const alertSub = this.add.text(0, 18, '블록 코딩을 완료하면 체력 100% 회복 및 보너스 점수를 획득합니다', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#e2e8f0'
        }).setOrigin(0.5);

        alertContainer.add([alertBg, alertTitle, alertSub]);

        this.time.delayedCall(1000, () => {
            alertContainer.destroy();

            this.isPaused = true;
            (this.player.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0);

            new BlockCodingModal(this, type, this.audioManager, (scoreBonus, coinBonus) => {
                this.bossDefeatedList.add(type);
                this.score += scoreBonus;
                this.coinsCollected += coinBonus;
                this.scoreText.setText(this.score.toLocaleString());
                this.coinText.setText(`${this.coinsCollected} G`);

                this.currentHp = this.maxHp;
                this.renderHpBar();

                this.isPaused = false;
                this.isBossActive = false;
                this.startFeverMode();
            });
        });
    }

    private renderBossHpBar() {
        if (!this.bossHpFill) return;
        this.bossHpFill.clear();

        const barW = 260;
        const barH = 10;
        const bx = -barW / 2;
        const by = 4;

        this.bossHpFill.fillStyle(0x1e293b, 1);
        this.bossHpFill.fillRoundedRect(bx, by, barW, barH, 3);

        const ratio = Math.max(0, this.bossHp / this.bossMaxHp);
        const color = ratio > 0.5 ? 0xef4444 : 0xf97316;
        this.bossHpFill.fillStyle(color, 1);
        if (ratio > 0) {
            this.bossHpFill.fillRoundedRect(bx, by, barW * ratio, barH, 3);
        }
    }

    private updateBoss(_deltaSec: number, delta: number) {
        if (!this.bossSprite || !this.isBossActive) return;

        this.bossAttackTimer -= delta;
        if (this.bossAttackTimer <= 0) {
            this.executeBossAttack();
            this.bossAttackTimer = Phaser.Math.Between(2200, 3000);
        }

        this.bossPatchTimer -= delta;
        if (this.bossPatchTimer <= 0) {
            this.spawnDebugPatch();
            this.bossPatchTimer = Phaser.Math.Between(1500, 2000);
        }
    }

    private executeBossAttack() {
        if (!this.bossSprite || !this.isBossActive) return;

        const { width } = this.scale;
        const bx = this.bossSprite.x - 20;
        const by = this.bossSprite.y;

        if (this.currentBossType === 'iltassafy') {
            const attackType = Phaser.Math.Between(0, 1);
            if (attackType === 0) {
                const ball = this.bossProjectiles.create(bx, by, 'boss_projectile_ball') as Phaser.Physics.Arcade.Sprite;
                ball.setDepth(16);
                const bbody = ball.body as Phaser.Physics.Arcade.Body;
                if (bbody) {
                    bbody.setAllowGravity(true);
                    bbody.setBounce(0.9, 0.85);
                    bbody.setVelocityX(-this.currentSpeed * 1.25);
                    bbody.setVelocityY(-200);
                    bbody.setSize(30, 30);
                }
                this.physics.add.collider(ball, this.groundColliderGroup);
            } else {
                const cue = this.obstacles.create(width + 100, this.groundY - 55, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
                cue.setDepth(16);
                const cbody = cue.body as Phaser.Physics.Arcade.Body;
                if (cbody) {
                    cbody.setAllowGravity(false);
                    cbody.setVelocityX(-this.currentSpeed * 1.2);
                    cbody.setSize(58, 22);
                }
            }
        } else {
            const isHigh = Phaser.Math.Between(0, 1) === 1;
            const shellY = isHigh ? this.groundY - 75 : this.groundY - 26;
            const shell = this.bossProjectiles.create(bx, shellY, 'boss_projectile_shell') as Phaser.Physics.Arcade.Sprite;
            shell.setDepth(16);
            const sbody = shell.body as Phaser.Physics.Arcade.Body;
            if (sbody) {
                sbody.setAllowGravity(false);
                sbody.setVelocityX(-this.currentSpeed * 1.3);
                sbody.setSize(38, 20);
            }
        }
    }

    private spawnDebugPatch() {
        const { width } = this.scale;
        const isJumpHeight = Phaser.Math.Between(0, 1) === 1;
        const patchY = isJumpHeight ? this.groundY - 80 : this.groundY - 32;

        const patch = this.bossPatches.create(width + 40, patchY, 'item_debug_patch') as Phaser.Physics.Arcade.Sprite;
        patch.setDepth(16);
        const pbody = patch.body as Phaser.Physics.Arcade.Body;
        if (pbody) {
            pbody.setAllowGravity(false);
            pbody.setVelocityX(-this.currentSpeed);
            pbody.setSize(34, 34);
        }
    }

    private collectDebugPatch(patch: Phaser.Physics.Arcade.Sprite) {
        patch.destroy();
        this.audioManager.playBossHit();
        this.score += 300;
        this.scoreText.setText(this.score.toLocaleString());

        if (this.bossSprite && this.isBossActive) {
            const bolt = this.add.graphics().setDepth(25);
            bolt.lineStyle(2, 0x38bdf8, 0.7);
            bolt.lineBetween(this.player.x, this.player.y - 30, this.bossSprite.x, this.bossSprite.y);
            this.time.delayedCall(100, () => bolt.destroy());

            this.bossHp -= 25;
            const nameLabel = this.currentBossType === 'iltassafy' ? '일타싸피 AI BOSS' : '배틀싸피 TANK BOSS';
            this.bossHpText?.setText(`${nameLabel} - ${Math.max(0, this.bossHp)}%`);
            this.renderBossHpBar();

            if (this.bossHp <= 0) {
                this.defeatBoss();
            }
        }
    }

    private handleHitBossProjectile(proj: Phaser.Physics.Arcade.Sprite) {
        proj.destroy();
        const hitSuccess = this.player.hit();
        if (!hitSuccess) return;

        this.currentHp -= 32;
        this.combo = 0;
        this.comboText.setText('');

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
        }
    }

    private defeatBoss() {
        this.audioManager.playBossDefeat();

        if (this.currentBossType) {
            this.bossDefeatedList.add(this.currentBossType);
        }

        if (this.bossSprite) {
            this.bossSprite.destroy();
        }

        this.score += 5000;
        this.scoreText.setText(this.score.toLocaleString());
        this.startFeverMode();

        this.bossHpContainer?.destroy();
        this.bossHpContainer = undefined;
        this.isBossActive = false;
        this.nextWaveTimer = 1200;
    }

    private applyMagneticAttraction() {
        const magnetRadius = this.isFeverActive ? 260 : 180;
        const px = this.player.x;
        const py = this.player.y - 32;

        this.jellies.getChildren().forEach((child) => {
            const j = child as Phaser.Physics.Arcade.Sprite;
            if (!j.active) return;
            const dist = Phaser.Math.Distance.Between(px, py, j.x, j.y);
            if (dist < magnetRadius) {
                const angle = Phaser.Math.Angle.Between(j.x, j.y, px, py);
                j.x += Math.cos(angle) * 550 * 0.016;
                j.y += Math.sin(angle) * 550 * 0.016;
            }
        });

        this.items.getChildren().forEach((child) => {
            const item = child as Phaser.Physics.Arcade.Sprite;
            if (!item.active) return;
            const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
            if (dist < magnetRadius) {
                const angle = Phaser.Math.Angle.Between(item.x, item.y, px, py);
                item.x += Math.cos(angle) * 500 * 0.016;
                item.y += Math.sin(angle) * 500 * 0.016;
            }
        });
    }

    private spawnNextWave() {
        const patterns = [1, 2, 3, 5, 7, 8, 9, 1, 7, 8];
        if (this.waveCount > 0 && this.waveCount % 6 === 0) patterns.push(4, 6);
        const available = patterns.filter(p => p !== this.lastPatternIndex);
        const selected = Phaser.Math.RND.pick(available);
        this.lastPatternIndex = selected;

        let waveDurationMs = 1250;

        switch (selected) {
            case 0:
                waveDurationMs = this.spawnCoinSprintWave();
                break;
            case 1:
                waveDurationMs = this.spawnJumpArcWave();
                break;
            case 2:
                waveDurationMs = this.spawnSlideTunnelWave();
                break;
            case 3:
                waveDurationMs = this.spawnFloatingPlatformWave();
                break;
            case 4:
                waveDurationMs = this.spawnMagnetPowerupWave();
                break;
            case 5:
                waveDurationMs = this.spawnDoubleJumpQrWave();
                break;
            case 6:
                waveDurationMs = this.spawnCoffeeRestWave();
                break;
            case 7:
                waveDurationMs = this.spawnJumpSlideComboWave();
                break;
            case 8:
                waveDurationMs = this.spawnDoubleObstacleWave();
                break;
            case 9:
                waveDurationMs = this.spawnFlyingBugSwarmWave();
                break;
        }

        const baseInterval = this.currentStageConfig ? this.currentStageConfig.waveIntervalMs : 1100;
        const speedRatio = Math.max(0.6, 460 / this.currentSpeed);
        this.nextWaveTimer = Math.max(620, Math.min(baseInterval, waveDurationMs * speedRatio));
        this.waveCount++;

        if (UpgradeManager.isArcadeDashEnabled() && this.waveCount % 2 === 0) {
            const nextIdx = this.collectedLetters.findIndex(v => !v);
            if (nextIdx !== -1) {
                const { width } = this.scale;
                const letterSprite = this.items.create(width + 320, this.groundY - 95, `letter_${nextIdx}`) as Phaser.Physics.Arcade.Sprite;
                letterSprite.setDepth(18);
                const lbody = letterSprite.body as Phaser.Physics.Arcade.Body;
                if (lbody) {
                    lbody.setAllowGravity(false);
                    lbody.setVelocityX(-this.currentSpeed);
                }
                letterSprite.setData('type', 'letter');
                letterSprite.setData('letterIndex', nextIdx);
            }
        }
    }

    private triggerDroneAutonomousAssist() {
        const dronePos = this.player.getDronePosition();

        if (!this.player.hasShield) {
            this.player.activateShield();
            this.audioManager.playMagnet();
            return;
        }

        const { width } = this.scale;
        let targetObs: Phaser.Physics.Arcade.Sprite | null = null;
        let minDist = 9999;

        this.obstacles.getChildren().forEach((child) => {
            const obs = child as Phaser.Physics.Arcade.Sprite;
            if (obs.active && obs.x > this.player.x + 20 && obs.x < width - 40) {
                const d = obs.x - this.player.x;
                if (d < minDist) {
                    minDist = d;
                    targetObs = obs;
                }
            }
        });

        if (targetObs) {
            const obs = targetObs as Phaser.Physics.Arcade.Sprite;
            const beam = this.add.graphics().setDepth(45);
            beam.lineStyle(2, 0x38bdf8, 0.55);
            beam.beginPath();
            beam.moveTo(dronePos.x + 10, dronePos.y);
            beam.lineTo(obs.x, obs.y);
            beam.strokePath();

            this.tweens.add({
                targets: beam,
                alpha: 0,
                duration: 180,
                onComplete: () => beam.destroy()
            });

            const bonus = Math.round(350 * this.scoreBonusMultiplier);
            this.score += bonus;
            this.scoreText.setText(this.score.toLocaleString());
            obs.destroy();
        }
    }

    private spawnCoinSprintWave(): number {
        const { width } = this.scale;
        for (let i = 0; i < 6; i++) {
            const c = this.jellies.create(width + (i * 45), this.groundY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }
        return 1700;
    }

    private spawnJumpArcWave(): number {
        const { width } = this.scale;
        const obstacleX = width + 220;

        const tex = Phaser.Math.Between(0, 1) === 0 ? 'obstacle_error' : 'obstacle_bug';
        const obs = this.obstacles.create(obstacleX, this.groundY - 24, tex) as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(38, 38);
        }

        const arcOffsets = [
            { x: -110, y: -55 }, { x: -55, y: -90 },
            { x: 0, y: -100 }, { x: 55, y: -90 }, { x: 110, y: -55 }
        ];

        arcOffsets.forEach(pt => {
            const j = this.jellies.create(obstacleX + pt.x, this.groundY + pt.y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 1900;
    }

    private spawnSlideTunnelWave(): number {
        const { width } = this.scale;
        const barrierX = width + 200;

        const obs = this.obstacles.create(barrierX, this.groundY - 68, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(58, 22);
        }

        for (let i = -90; i <= 90; i += 45) {
            const j = this.jellies.create(barrierX + i, this.groundY - 18, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        }

        return 1800;
    }

    private spawnFloatingPlatformWave(): number {
        const { width } = this.scale;
        const platX = width + 200;
        const platY = this.groundY - 95;

        const plat = this.floatingPlatforms.create(platX, platY, 'platform_tex') as Phaser.Physics.Arcade.Sprite;
        plat.setDepth(12);
        const body = plat.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setImmovable(true);
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(160, 24);
        }

        for (let i = -60; i <= 60; i += 40) {
            const c = this.jellies.create(platX + i, platY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }

        const obs = this.obstacles.create(platX, this.groundY - 24, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const obody = obs.body as Phaser.Physics.Arcade.Body;
        if (obody) {
            obody.setAllowGravity(false);
            obody.setVelocityX(-this.currentSpeed);
        }

        return 1900;
    }

    private spawnMagnetPowerupWave(): number {
        const { width } = this.scale;
        const mag = this.items.create(width + 180, this.groundY - 55, 'item_magnet') as Phaser.Physics.Arcade.Sprite;
        mag.setDepth(16);
        const body = mag.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
        }
        mag.setData('type', 'magnet');

        for (let i = 1; i <= 4; i++) {
            const c = this.jellies.create(width + 180 + (i * 45), this.groundY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }

        return 1750;
    }

    private spawnDoubleJumpQrWave(): number {
        const { width } = this.scale;
        const centerX = width + 220;

        const obs = this.obstacles.create(centerX, this.groundY - 24, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(36, 32);
        }

        const qr = this.jellies.create(centerX, this.groundY - 145, 'jelly_qr') as Phaser.Physics.Arcade.Sprite;
        this.setupItemPhysics(qr, 300, 'qr');

        return 1900;
    }

    private spawnCoffeeRestWave(): number {
        const { width } = this.scale;
        const coffeeX = width + 180;

        const coffee = this.items.create(coffeeX, this.groundY - 60, 'item_coffee') as Phaser.Physics.Arcade.Sprite;
        coffee.setDepth(16);
        const body = coffee.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
        }
        coffee.setData('type', 'coffee');

        return 1400;
    }

    private spawnJumpSlideComboWave(): number {
        const { width } = this.scale;
        const firstX = width + 100;
        const gap = Math.max(220, Math.round(this.currentSpeed * 0.48));

        const obs1 = this.obstacles.create(firstX, this.groundY - 24, 'obstacle_error') as Phaser.Physics.Arcade.Sprite;
        obs1.setDepth(15);
        const b1 = obs1.body as Phaser.Physics.Arcade.Body;
        if (b1) {
            b1.setAllowGravity(false);
            b1.setVelocityX(-this.currentSpeed);
            b1.setSize(38, 38);
        }

        const obs2 = this.obstacles.create(firstX + gap, this.groundY - 68, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
        obs2.setDepth(15);
        const b2 = obs2.body as Phaser.Physics.Arcade.Body;
        if (b2) {
            b2.setAllowGravity(false);
            b2.setVelocityX(-this.currentSpeed);
            b2.setSize(58, 22);
        }

        const c1 = this.jellies.create(firstX, this.groundY - 95, 'item_coin') as Phaser.Physics.Arcade.Sprite;
        this.setupItemPhysics(c1, 50, 'coin');
        const c2 = this.jellies.create(firstX + gap, this.groundY - 18, 'item_coin') as Phaser.Physics.Arcade.Sprite;
        this.setupItemPhysics(c2, 50, 'coin');

        return 1450;
    }

    private spawnDoubleObstacleWave(): number {
        const { width } = this.scale;
        const startX = width + 90;
        const spacing = Math.max(230, Math.round(this.currentSpeed * 0.52));

        [0, spacing].forEach((offset, idx) => {
            const tex = idx === 0 ? 'obstacle_bug' : 'obstacle_error';
            const obs = this.obstacles.create(startX + offset, this.groundY - 24, tex) as Phaser.Physics.Arcade.Sprite;
            obs.setDepth(15);
            const body = obs.body as Phaser.Physics.Arcade.Body;
            if (body) {
                body.setAllowGravity(false);
                body.setVelocityX(-this.currentSpeed);
                body.setSize(38, 38);
            }
        });

        if (this.currentStageId >= 3 || this.gameMode === 'infinite') {
            const highBug = this.obstacles.create(startX + spacing / 2, this.groundY - 135, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
            highBug.setDepth(15);
            const hbody = highBug.body as Phaser.Physics.Arcade.Body;
            if (hbody) {
                hbody.setAllowGravity(false);
                hbody.setVelocityX(-this.currentSpeed * 1.08);
                hbody.setSize(34, 32);
            }
        }

        return 1500;
    }

    private spawnFlyingBugSwarmWave(): number {
        const { width } = this.scale;
        const startX = width + 100;

        const flyBug = this.obstacles.create(startX, this.groundY - 64, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
        flyBug.setDepth(16);
        const fbody = flyBug.body as Phaser.Physics.Arcade.Body;
        if (fbody) {
            fbody.setAllowGravity(false);
            fbody.setVelocityX(-this.currentSpeed * 1.15);
            fbody.setSize(36, 32);
        }

        const groundObs = this.obstacles.create(startX + 250, this.groundY - 24, 'obstacle_error') as Phaser.Physics.Arcade.Sprite;
        groundObs.setDepth(15);
        const gbody = groundObs.body as Phaser.Physics.Arcade.Body;
        if (gbody) {
            gbody.setAllowGravity(false);
            gbody.setVelocityX(-this.currentSpeed);
            gbody.setSize(38, 38);
        }

        return 1450;
    }

    private setupItemPhysics(item: Phaser.Physics.Arcade.Sprite, points: number, type: string) {
        item.setDepth(16);
        const body = item.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(34, 34);
        }
        item.setData('points', points);
        item.setData('type', type);
    }

    private cleanOffscreen(group: Phaser.Physics.Arcade.Group) {
        group.getChildren().forEach((child) => {
            const sprite = child as Phaser.Physics.Arcade.Sprite;
            if (sprite.x < -80) {
                sprite.destroy();
            }
        });
    }

    private createHUD() {
        const { width } = this.scale;

        const barX = 30;
        const barY = 32;

        this.stageText = this.add.text(barX, barY - 20, 'STAGE 1', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#facc15'
        }).setDepth(50);

        this.hpText = this.add.text(barX + 85, barY - 20, 'MENTAL HP: 100%', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#cbd5e1'
        }).setDepth(50);

        const hpBarBg = this.add.graphics().setDepth(50);
        hpBarBg.fillStyle(0x0f172a, 0.85);
        hpBarBg.lineStyle(2, 0x475569);
        hpBarBg.fillRoundedRect(barX, barY, 260, 20, 6);
        hpBarBg.strokeRoundedRect(barX, barY, 260, 20, 6);

        this.hpBarFill = this.add.graphics().setDepth(50);
        this.renderHpBar();

        this.magnetHudText = this.add.text(barX, barY + 26, 'MAGNET: 6.0s', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#38bdf8'
        }).setDepth(50).setVisible(false);

        if (UpgradeManager.isArcadeDashEnabled()) {
            const letters = ['S', 'S', 'A', 'F', 'Y'];
            this.letterHudTexts = [];
            letters.forEach((ch, idx) => {
                const lx = barX + idx * 32;
                const ly = barY + 50;
                const slotBg = this.add.graphics().setDepth(50);
                slotBg.fillStyle(0x0f172a, 0.85);
                slotBg.lineStyle(1.5, 0x334155);
                slotBg.fillRoundedRect(lx, ly, 26, 26, 6);
                slotBg.strokeRoundedRect(lx, ly, 26, 26, 6);

                const lTxt = this.add.text(lx + 13, ly + 13, ch, {
                    fontFamily: 'Arial Black',
                    fontSize: '14px',
                    color: '#475569'
                }).setOrigin(0.5).setDepth(51);
                this.letterHudTexts.push(lTxt);
            });

            this.dashHudText = this.add.text(barX, barY + 84, 'DASH [Shift] 준비완료', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '13px',
                color: '#38bdf8',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                padding: { x: 8, y: 4 }
            }).setDepth(55).setInteractive({ useHandCursor: true });

            this.dashHudText.on('pointerdown', () => {
                this.events.emit('request-hyper-dash');
            });
        }

        if (this.gameMode === 'stage') {
            this.stageGoalText = this.add.text(width / 2, 20, `STAGE ${this.currentStageId} : 0m / ${this.targetDistance}m`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '16px',
                color: '#e2e8f0'
            }).setOrigin(0.5, 0).setDepth(50);

            this.stageProgressBar = this.add.graphics().setDepth(50);
            this.renderStageProgressBar();

            this.coinText = this.add.text(width / 2 + 155, 20, '0 G', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '18px',
                color: '#eab308'
            }).setOrigin(0, 0).setDepth(50);

            this.distanceText = this.add.text(0, 0, '', {}).setVisible(false);
        } else {
            this.distanceText = this.add.text(width / 2 - 50, 24, '0m', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '20px',
                color: '#e2e8f0'
            }).setOrigin(0.5, 0).setDepth(50);

            this.coinText = this.add.text(width / 2 + 55, 24, '0 G', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '20px',
                color: '#eab308'
            }).setOrigin(0.5, 0).setDepth(50);
        }

        this.feverText = this.add.text(width / 2, 54, 'FEVER TIME (점수 2배)', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#eab308'
        }).setOrigin(0.5, 0).setDepth(50).setVisible(false);

        this.feverBar = this.add.graphics().setDepth(50).setVisible(false);

        this.scoreText = this.add.text(width - 190, 18, '0', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '28px',
            color: '#f8fafc'
        }).setOrigin(1, 0).setDepth(50);

        this.add.text(width - 190, 52, `BEST: ${this.highScore.toLocaleString()}`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(1, 0).setDepth(50);

        this.comboText = this.add.text(width - 190, 74, '', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(1, 0).setDepth(50);

        // Direct Exit to Main Menu Button
        const exitBtn = this.add.container(width - 122, 40).setDepth(120);
        const exitBg = this.add.graphics();
        exitBg.fillStyle(0x0f172a, 0.9);
        exitBg.lineStyle(2, 0x38bdf8);
        exitBg.fillRoundedRect(-44, -20, 88, 40, 10);
        exitBg.strokeRoundedRect(-44, -20, 88, 40, 10);
        const exitTxt = this.add.text(0, 0, '◀ 메인', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);
        const exitZone = this.add.zone(0, 0, 88, 40).setOrigin(0.5).setInteractive({ useHandCursor: true });
        exitBtn.add([exitBg, exitTxt, exitZone]);
        exitZone.on('pointerdown', () => {
            this.audioManager.stopBgm();
            this.scene.start('MainMenu');
        });

        // Pause Button
        const pauseBtn = this.add.container(width - 44, 40).setDepth(120);
        const pauseBg = this.add.graphics();
        pauseBg.fillStyle(0x0f172a, 0.9);
        pauseBg.lineStyle(2, 0x38bdf8);
        pauseBg.fillCircle(0, 0, 20);
        pauseBg.strokeCircle(0, 0, 20);

        const pauseIcon = this.add.text(0, 0, '❚❚', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const pauseZone = this.add.zone(0, 0, 44, 44).setOrigin(0.5).setInteractive({ useHandCursor: true });
        pauseBtn.add([pauseBg, pauseIcon, pauseZone]);
        pauseZone.on('pointerdown', () => this.togglePause());
    }

    private renderHpBar() {
        const hpRatio = Phaser.Math.Clamp(this.currentHp / this.maxHp, 0, 1);
        this.hpBarFill.clear();

        let barColor = 0x22c55e;
        if (hpRatio < 0.28) {
            barColor = 0xef4444;
        } else if (hpRatio < 0.6) {
            barColor = 0xf59e0b;
        }

        this.hpBarFill.fillStyle(barColor, 1);
        if (hpRatio > 0) {
            this.hpBarFill.fillRoundedRect(32, 34, 256 * hpRatio, 16, 4);
        }

        this.hpText.setText(`MENTAL HP: ${Math.round(this.currentHp)}%`);
    }

    private renderFeverBar() {
        const { width } = this.scale;
        const ratio = Phaser.Math.Clamp(this.feverTimeRemaining / 5.5, 0, 1);
        this.feverBar.clear();

        const barW = 240;
        const barH = 6;
        const bx = (width - barW) / 2;
        const by = 78;

        this.feverBar.fillStyle(0x0f172a, 0.8);
        this.feverBar.fillRoundedRect(bx, by, barW, barH, 3);

        this.feverBar.fillStyle(0xeab308, 1);
        this.feverBar.fillRoundedRect(bx, by, barW * ratio, barH, 3);
    }

    private startFeverMode() {
        this.isFeverActive = true;
        this.feverTimeRemaining = 5.5;
        this.player.setFever(true);
        this.audioManager.playFever();

        this.feverText.setVisible(true);
        this.feverBar.setVisible(true);
    }

    private endFeverMode() {
        this.isFeverActive = false;
        this.player.setFever(false);
        this.feverText.setVisible(false);
        this.feverBar.setVisible(false);
    }

    private collectJelly(jelly: Phaser.Physics.Arcade.Sprite) {
        const points = jelly.getData('points') || 100;
        const type = jelly.getData('type') || 'grass';

        this.combo++;
        if (type === 'coin') {
            this.coinsCollected++;
            this.audioManager.playCoin();
        } else if (type === 'grass') {
            this.commitCount++;
            this.audioManager.playJelly();
        } else {
            this.qrCount++;
            this.audioManager.playQr();
        }

        let multiplier = 1;
        if (this.combo >= 20) multiplier = 3;
        else if (this.combo >= 10) multiplier = 2;

        if (this.isFeverActive) {
            multiplier *= 2;
        } else if (this.combo >= 15 && this.combo % 15 === 0) {
            this.startFeverMode();
        }

        const totalEarned = Math.round(points * multiplier * this.scoreBonusMultiplier);
        this.score += totalEarned;
        this.scoreText.setText(this.score.toLocaleString());

        if (this.combo >= 3) {
            this.comboText.setText(`${this.combo} COMBO (x${multiplier})`);
        } else {
            this.comboText.setText('');
        }

        jelly.destroy();
    }

    private collectSpecialItem(item: Phaser.Physics.Arcade.Sprite) {
        const type = item.getData('type');

        if (type === 'magnet') {
            this.player.activateMagnet(6.5);
        } else if (type === 'coffee') {
            this.coffeeCount++;
            this.currentHp = Math.min(this.maxHp, this.currentHp + 25);
            this.renderHpBar();
            this.audioManager.playCoffee();
        } else if (type === 'fever') {
            this.startFeverMode();
        } else if (type === 'letter') {
            const idx = item.getData('letterIndex') ?? 0;
            this.collectedLetters[idx] = true;
            this.audioManager.playQr();
            if (this.letterHudTexts[idx]) {
                this.letterHudTexts[idx].setColor('#eab308');
            }
            const letterBonus = Math.round(300 * this.scoreBonusMultiplier);
            this.score += letterBonus;
            this.scoreText.setText(this.score.toLocaleString());

            if (this.collectedLetters.every(v => v)) {
                this.triggerSsafyBonusTime();
            }
        }

        item.destroy();
    }

    private triggerSsafyBonusTime() {
        this.collectedLetters = [false, false, false, false, false];
        this.letterHudTexts.forEach(t => t.setColor('#475569'));

        const bonusScore = Math.round(3500 * this.scoreBonusMultiplier);
        this.score += bonusScore;
        this.coinsCollected += 25;
        SkinManager.addCoins(25);
        this.currentHp = Math.min(this.maxHp, this.currentHp + 35);
        this.player.activateShield();
        this.renderHpBar();
        this.scoreText.setText(this.score.toLocaleString());
        this.startFeverMode();
    }

    private handleHitObstacle(obs: Phaser.Physics.Arcade.Sprite) {
        if (this.isFeverActive || this.player.isDashing) {
            const smashBonus = Math.round(500 * this.scoreBonusMultiplier);
            this.score += smashBonus;
            this.scoreText.setText(this.score.toLocaleString());
            obs.destroy();
            return;
        }

        if (this.player.hasShield) {
            this.player.breakShield();
            obs.destroy();
            return;
        }

        const hitSuccess = this.player.hit();
        if (!hitSuccess) return;

        obs.disableBody(true, false);
        this.tweens.add({
            targets: obs,
            alpha: 0,
            duration: 180,
            onComplete: () => obs.destroy()
        });

        this.currentHp -= 32;
        this.combo = 0;
        this.comboText.setText('');

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
        }
    }

    private togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.showPauseMenu();
        } else {
            this.physics.resume();
            this.pauseContainer?.destroy();
            this.pauseContainer = undefined;
        }
    }

    private showPauseMenu() {
        const { width, height } = this.scale;
        this.pauseContainer = this.add.container(0, 0).setDepth(200);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.7);
        dim.fillRect(0, 0, width, height);
        this.pauseContainer.add(dim);

        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.96);
        panel.lineStyle(2, 0x38bdf8);
        panel.fillRoundedRect(width / 2 - 160, height / 2 - 140, 320, 280, 16);
        panel.strokeRoundedRect(width / 2 - 160, height / 2 - 140, 320, 280, 16);
        this.pauseContainer.add(panel);

        const title = this.add.text(width / 2, height / 2 - 95, '일시 정지', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '26px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.pauseContainer.add(title);

        const resumeBtn = this.createPauseBtn(width / 2, height / 2 - 35, '계속하기 (RESUME)', () => {
            this.togglePause();
        });

        const restartBtn = this.createPauseBtn(width / 2, height / 2 + 25, '다시 시작 (RESTART)', () => {
            this.pauseContainer?.destroy();
            this.scene.restart();
        });

        const menuBtn = this.createPauseBtn(width / 2, height / 2 + 85, '메인 화면 (MAIN)', () => {
            this.pauseContainer?.destroy();
            this.audioManager.stopBgm();
            this.scene.start('MainMenu');
        });

        this.pauseContainer.add([resumeBtn, restartBtn, menuBtn]);
    }

    private createPauseBtn(x: number, y: number, label: string, onClick: () => void, w: number = 240, h: number = 40): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.95);
        bg.lineStyle(2, 0x38bdf8);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

        const txt = this.add.text(0, 0, label, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);

        if (txt.width > w - 18) {
            txt.setScale((w - 18) / txt.width);
        }

        const hitZone = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        container.add([bg, txt, hitZone]);
        hitZone.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }

    private triggerGameOver() {
        this.physics.pause();
        this.audioManager.stopBgm();
        this.audioManager.playGameOver();

        SkinManager.addCoins(this.coinsCollected);

        this.scene.start('GameOver', {
            score: this.score,
            distance: Math.floor(this.distance),
            commits: this.commitCount,
            qrs: this.qrCount,
            coffees: this.coffeeCount,
            coins: this.coinsCollected,
            mode: this.gameMode,
            stageId: this.currentStageId
        });
    }

    private updateStageProgressHUD() {
        if (!this.stageGoalText || this.targetDistance <= 0) return;
        const currentM = Math.min(this.targetDistance, Math.floor(this.distance));
        this.stageGoalText.setText(`STAGE ${this.currentStageId} : ${currentM}m / ${this.targetDistance}m`);
        this.renderStageProgressBar();
    }

    private renderStageProgressBar() {
        if (!this.stageProgressBar || this.targetDistance <= 0) return;
        this.stageProgressBar.clear();

        const { width } = this.scale;
        const barW = 200;
        const barH = 8;
        const bx = width / 2 - barW / 2;
        const by = 48;

        this.stageProgressBar.fillStyle(0x0f172a, 0.85);
        this.stageProgressBar.fillRoundedRect(bx, by, barW, barH, 4);

        const ratio = Math.min(1, Math.max(0, this.distance / this.targetDistance));
        this.stageProgressBar.fillStyle(0x38bdf8, 1);
        if (ratio > 0) {
            this.stageProgressBar.fillRoundedRect(bx, by, barW * ratio, barH, 4);
        }
    }

    private spawnFinishGate() {
        const { width } = this.scale;
        this.finishGate = this.physics.add.sprite(width + 220, this.groundY - 100, 'finish_gate');
        this.finishGate.setDepth(15);
        const body = this.finishGate.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setImmovable(true);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(70, 190);
        }

        this.physics.add.overlap(this.player, this.finishGate, () => {
            this.triggerStageClear();
        });
    }

    private triggerStageClear() {
        if (this.isStageCleared) return;
        this.isStageCleared = true;

        this.audioManager.playStageClear();

        let stars = 1;
        if (this.currentHp >= 75) stars = 3;
        else if (this.currentHp >= 40) stars = 2;

        StageManager.saveStageProgress(this.currentStageId, stars, this.score);
        SkinManager.addCoins(this.coinsCollected);

        this.physics.pause();
        this.audioManager.stopBgm();

        this.showStageClearModal(stars);
    }

    private showStageClearModal(stars: number) {
        const { width, height } = this.scale;
        this.stageClearContainer = this.add.container(width / 2, height / 2).setDepth(200);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.75);
        dim.fillRect(-width / 2, -height / 2, width, height);
        this.stageClearContainer.add(dim);

        const cardW = 540;
        const cardH = 420;
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(2, 0x38bdf8);
        panel.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
        panel.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
        this.stageClearContainer.add(panel);

        const title = this.add.text(0, -cardH / 2 + 50, `STAGE ${this.currentStageId} CLEAR`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '30px',
            color: '#facc15'
        }).setOrigin(0.5);

        const subtitle = this.add.text(0, -cardH / 2 + 92, this.currentStageConfig ? this.currentStageConfig.title : 'SSAFY 과제 완주', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '17px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const starsText = stars === 3 ? '★ ★ ★' : stars === 2 ? '★ ★ ☆' : '★ ☆ ☆';
        const starsLabel = this.add.text(0, -cardH / 2 + 145, starsText, {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#eab308'
        }).setOrigin(0.5);

        const statsBox = this.add.graphics();
        statsBox.fillStyle(0x1e293b, 0.85);
        statsBox.lineStyle(1, 0x475569);
        statsBox.fillRoundedRect(-210, -20, 420, 100, 12);
        statsBox.strokeRoundedRect(-210, -20, 420, 100, 12);
        this.stageClearContainer.add(statsBox);

        const hpStat = this.add.text(-105, 8, `잔여 멘탈: ${Math.round(this.currentHp)}%`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#4ade80'
        }).setOrigin(0.5);

        const coinStat = this.add.text(105, 8, `획득 골드: +${this.coinsCollected} G`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#fde047'
        }).setOrigin(0.5);

        const scoreStat = this.add.text(0, 45, `최종 점수: ${this.score.toLocaleString()}점`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '20px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        this.stageClearContainer.add([title, subtitle, starsLabel, hpStat, coinStat, scoreStat]);

        const btnY = cardH / 2 - 50;

        if (this.currentStageId < 30) {
            const nextBtn = this.createPauseBtn(-155, btnY, `다음 단계 (STAGE ${this.currentStageId + 1})`, () => {
                this.stageClearContainer?.destroy();
                this.scene.restart({ mode: 'stage', stageId: this.currentStageId + 1 });
            }, 185, 42);

            const mapBtn = this.createPauseBtn(15, btnY, '스테이지 선택', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('StageSelect');
            }, 135, 42);

            const homeBtn = this.createPauseBtn(165, btnY, '메인 화면', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('MainMenu');
            }, 135, 42);

            this.stageClearContainer.add([nextBtn, mapBtn, homeBtn]);
        } else {
            const mapBtn = this.createPauseBtn(-100, btnY, '스테이지 선택', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('StageSelect');
            }, 170, 44);

            const homeBtn = this.createPauseBtn(100, btnY, '메인 화면으로', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('MainMenu');
            }, 170, 44);

            this.stageClearContainer.add([mapBtn, homeBtn]);
        }
    }
}
