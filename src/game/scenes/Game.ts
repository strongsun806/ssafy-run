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
    private baseSpeed: number = 440;
    private currentSpeed: number = 440;
    private maxSpeed: number = 750;
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
        this.cameras.main.fadeIn(300, 10, 14, 26);

        // Load stage config if in stage mode
        if (this.gameMode === 'stage') {
            this.currentStageConfig = StageManager.getStageConfig(this.currentStageId);
            this.baseSpeed = this.currentStageConfig.baseSpeed;
            this.targetDistance = this.currentStageConfig.targetDistance;
            this.currentStage = this.currentStageConfig.themeStage;
        } else {
            this.baseSpeed = 440;
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
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.isFeverActive = false;
        this.feverTimeRemaining = 0;
        this.isPaused = false;
        this.nextWaveTimer = 800;
        this.highScore = ScoreManager.getHighScore();

        // Reset Boss State
        this.isBossActive = false;
        this.currentBossType = null;
        this.bossDefeatedList.clear();

        this.groundY = height - 75;
        this.lastPitDistance = 0;

        // 1. Sky & Parallax (Stage 1 initial)
        this.add.graphics()
            .fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x171e38, 0x241b3e, 1)
            .fillRect(0, 0, width, height);

        this.bgFarTile = this.add.tileSprite(0, height - 350, width, 400, 'bg_s1_far')
            .setOrigin(0, 0)
            .setAlpha(0.45);

        this.bgNearTile = this.add.tileSprite(0, height - 230, width, 280, 'bg_s1_near')
            .setOrigin(0, 0)
            .setAlpha(0.7);

        // 2. Segmented Ground & Platforms (Arcade dynamic bodies with immovable)
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
        if (UpgradeManager.isRpgTechEnabled()) {
            this.player.activateShield();
        }
        this.events.off('request-hyper-dash');
        this.events.on('request-hyper-dash', () => {
            if (UpgradeManager.isArcadeDashEnabled()) {
                if (this.player.triggerHyperDash(true)) {
                    this.cameras.main.flash(180, 34, 211, 238);
                }
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

        // 7. Keyboard listeners
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-P', () => this.togglePause());
            this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        }

        this.audioManager.startBgm();
    }

    private initGroundSegments() {
        this.groundSegments = [];
        // Create continuous starting floor for first 2200px
        this.spawnGroundSegment(0, 2200, false, false);
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
        // Deep abyss container at bottom
        const pitHazard = this.add.tileSprite(pitStartX, this.groundY, pitWidth, 75, 'pit_hazard')
            .setOrigin(0, 0)
            .setDepth(4);

        // Warning text: "⚠️ JUMP! 🕳️"
        const warn = this.add.text(pitStartX + pitWidth / 2, this.groundY - 30, '⚠️ JUMP! 🕳️', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#ef4444',
            stroke: '#0f172a',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(15);

        this.tweens.add({
            targets: warn,
            y: this.groundY - 40,
            alpha: 0.45,
            duration: 280,
            yoyo: true,
            repeat: -1
        });

        // Parabolic arc of 4 gold coins over the pit to guide the player's jump
        const numCoins = 4;
        for (let i = 0; i < numCoins; i++) {
            const t = (i + 1) / (numCoins + 1);
            const coinX = pitStartX + pitWidth * t;
            const coinY = this.groundY - 25 - Math.sin(t * Math.PI) * 55;
            const coin = this.jellies.create(coinX, coinY, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(coin, 50, 'coin');
        }

        this.time.delayedCall(4500, () => warn.destroy());

        return pitHazard;
    }

    private setupTouchControls() {
        const { width, height } = this.scale;

        if (this.textures.exists('btn_touch_slide')) {
            this.slideBtn = this.add.image(90, height - 90, 'btn_touch_slide')
                .setDepth(60)
                .setAlpha(0.75);
        }

        if (this.textures.exists('btn_touch_jump')) {
            this.jumpBtn = this.add.image(width - 90, height - 90, 'btn_touch_jump')
                .setDepth(60)
                .setAlpha(0.75);
        }

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPaused) return;
            if (pointer.x > width - 80 && pointer.y < 80) return;

            if (pointer.x < width / 2) {
                this.player.setTouchSlide(true);
                this.slideBtn?.setAlpha(1.0).setScale(0.92);
            } else {
                this.player.requestTouchJump();
                this.jumpBtn?.setAlpha(1.0).setScale(0.92);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2) {
                this.player.setTouchSlide(false);
                this.slideBtn?.setAlpha(0.75).setScale(1.0);
            } else {
                this.jumpBtn?.setAlpha(0.75).setScale(1.0);
            }
        });
    }

    update(_time: number, delta: number) {
        if (this.isPaused || this.isStageCleared) return;

        const deltaSec = delta / 1000;

        // Distance & Progressive Speed Scaling (with Hyper Dash 1.85x speed boost!)
        const dashSpeedMult = this.player.isDashing ? 1.85 : 1.0;
        const effectiveSpeed = this.currentSpeed * dashSpeedMult;
        this.distance += (effectiveSpeed * deltaSec) / 10;
        this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + Math.floor(this.distance * 0.22));

        // AI Companion Bit-Drone Autonomous Assist (RPG Tech Lab)
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
                this.dashHudText.setText('⚡ HYPER DASH 발동 중!!');
                this.dashHudText.setColor('#fef08a');
            } else if (this.player.dashCooldownRemaining > 0) {
                this.dashHudText.setText(`⚡ DASH 쿨타임: ${this.player.dashCooldownRemaining.toFixed(1)}s`);
                this.dashHudText.setColor('#94a3b8');
            } else {
                this.dashHudText.setText('⚡ [Shift / 클릭] HYPER DASH 준비완료!');
                this.dashHudText.setColor('#22d3ee');
            }
        }

        // Check Stage Finish Gate in Stage Mode
        if (this.gameMode === 'stage') {
            this.updateStageProgressHUD();
            if (this.distance >= this.targetDistance - 25 && !this.finishGate) {
                this.spawnFinishGate();
            }
        }

        // Parallax background scrolling
        if (this.bgFarTile) this.bgFarTile.tilePositionX += (this.currentSpeed * 0.05) * deltaSec;
        if (this.bgNearTile) this.bgNearTile.tilePositionX += (this.currentSpeed * 0.16) * deltaSec;

        // Ground segments scrolling & pit management
        this.updateGroundSegments(deltaSec);

        // Check for falling into pit / hole
        if (this.player.y > this.groundY + 45 && !this.player.isRescuing) {
            this.handleFallIntoPit();
        }

        // Check Stage Transitions (Stage 1 -> Stage 2 -> Stage 3)
        this.checkStageProgression();

        // Check Boss Encounters (일타싸피, 배틀싸피)
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
            this.magnetHudText.setText(`🧲 MAGNET: ${this.player.magnetTimeRemaining.toFixed(1)}s`);
        } else {
            this.magnetHudText.setVisible(false);
        }

        // Wave generator (Paused during Boss Encounter)
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

        // Temporary Magnet Attraction (Only active when player has magnet power-up!)
        if (this.player.magnetTimeRemaining > 0 || this.isFeverActive) {
            this.applyMagneticAttraction();
        }

        // Update HUD
        this.distanceText.setText(`📍 ${Math.floor(this.distance)}m`);
        this.coinText.setText(`🪙 ${this.coinsCollected}`);

        // Clean off-screen objects
        this.cleanOffscreen(this.obstacles);
        this.cleanOffscreen(this.jellies);
        this.cleanOffscreen(this.items);
        this.cleanOffscreen(this.floatingPlatforms);
        this.cleanOffscreen(this.bossProjectiles);
        this.cleanOffscreen(this.bossPatches);
    }

    // Segmented Ground Management (Supports Gaps & Pits with 100% Physics Sync)
    private updateGroundSegments(deltaSec: number) {
        const { width } = this.scale;
        const shift = this.currentSpeed * deltaSec;

        // Move existing segments left and keep physics bodies 100% in sync
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

            // Remove if scrolled past
            if (seg.x + seg.width < -200) {
                seg.tile.destroy();
                seg.body.destroy();
                if (seg.leftCap) seg.leftCap.destroy();
                if (seg.rightCap) seg.rightCap.destroy();
                if (seg.pitHazard) seg.pitHazard.destroy();
                this.groundSegments.splice(i, 1);
            }
        }

        // Spawn new segments ahead
        const lastSeg = this.groundSegments[this.groundSegments.length - 1];
        if (lastSeg && lastSeg.x + lastSeg.width < width + 600) {
            const nextX = lastSeg.x + lastSeg.width;

            // Only generate pits after 180m, with at least 130m interval
            const canCreatePit = this.distance >= 180 && (this.distance - this.lastPitDistance) > 130;
            const shouldCreatePit = canCreatePit && Phaser.Math.Between(1, 3) === 1;

            if (shouldCreatePit) {
                this.lastPitDistance = this.distance;
                const pitWidth = Phaser.Math.Between(135, 160);
                const segWidth = Phaser.Math.Between(900, 1300);

                // Add right cliff cap to preceding segment
                if (!lastSeg.rightCap) {
                    lastSeg.rightCap = this.add.image(lastSeg.x + lastSeg.width - 14, this.groundY + 37, 'ground_cliff_left').setDepth(11);
                }

                const pitHazard = this.spawnPitHazard(nextX, pitWidth);
                const newSeg = this.spawnGroundSegment(nextX + pitWidth, segWidth, true, false);
                newSeg.pitHazard = pitHazard;
            } else {
                const segWidth = Phaser.Math.Between(900, 1400);
                this.spawnGroundSegment(nextX, segWidth, false, false);
            }
        }
    }

    // Falling into Pit: Takes 30 HP damage & SSAFY Emergency Rescue Drone lifts player up!
    private handleFallIntoPit() {
        this.currentHp -= 30;
        this.combo = 0;
        this.comboText.setText('');
        this.cameras.main.shake(140, 0.025);

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
            return;
        }

        this.renderHpBar();

        // GUARANTEE SOLID GROUND UNDER THE PLAYER SO THEY NEVER FALL AGAIN
        this.ensureGroundUnderPlayer();

        this.player.rescueFromPit(() => {
            // Re-anchored safely to ground
        });
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
            // Player is over a pit gap! Immediately spawn an emergency safety segment under them
            this.spawnGroundSegment(px - 100, 500, false, false);
        }
    }

    // Stage Progression (Stage 1 -> Stage 2 -> Stage 3)
    private checkStageProgression() {
        if (this.stageTransitioning) return;

        // Stage 2: 500m milestone (비상계단 지옥)
        if (this.currentStage === 1 && this.distance >= 500) {
            this.transitionToStage(2, '🚨 STAGE 2: 8시 55분 비상계단 질주!');
        }
        // Stage 3: 1100m milestone (멀캠 11층 랩실)
        else if (this.currentStage === 2 && this.distance >= 1100) {
            this.transitionToStage(3, '💻 STAGE 3: 멀캠 11층 코딩 랩실 도착!');
        }
    }

    private transitionToStage(newStage: number, bannerText: string) {
        this.currentStage = newStage;
        this.stageTransitioning = true;
        this.audioManager.playStageClear();

        // Flash Camera
        this.cameras.main.flash(400, 56, 189, 248);

        // Update Backgrounds
        if (this.bgFarTile) this.bgFarTile.setTexture(`bg_s${newStage}_far`);
        if (this.bgNearTile) this.bgNearTile.setTexture(`bg_s${newStage}_near`);

        // Announcement Banner
        const { width, height } = this.scale;
        this.stageBanner = this.add.container(width / 2, height / 2 - 80).setDepth(150);

        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0x0f172a, 0.95);
        bannerBg.lineStyle(3, 0xfacc15);
        bannerBg.fillRoundedRect(-320, -35, 640, 70, 16);
        bannerBg.strokeRoundedRect(-320, -35, 640, 70, 16);

        const bannerLbl = this.add.text(0, 0, bannerText, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#facc15'
        }).setOrigin(0.5);

        this.stageBanner.add([bannerBg, bannerLbl]);
        this.stageBanner.setScale(0);

        this.tweens.add({
            targets: this.stageBanner,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1600, () => {
                    this.tweens.add({
                        targets: this.stageBanner,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            this.stageBanner?.destroy();
                            this.stageTransitioning = false;
                        }
                    });
                });
            }
        });

        this.stageText.setText(`STAGE ${newStage}`);
    }

    // --- Boss Encounter System (SSAFY Evaluation Boss Battles) ---
    private checkBossProgression() {
        if (this.isBossActive) return;

        // Stage Mode Boss
        if (this.gameMode === 'stage') {
            if (this.currentStageConfig?.bossType) {
                const bossDist = this.targetDistance * 0.35;
                if (this.distance >= bossDist && !this.bossDefeatedList.has(this.currentStageConfig.bossType)) {
                    this.startBossEncounter(this.currentStageConfig.bossType);
                }
            }
            return;
        }

        // Infinite Runner Mode Bosses
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
        this.cameras.main.flash(350, 56, 189, 248);

        const { width, height } = this.scale;

        // Break Time Invitation Banner
        const alertContainer = this.add.container(width / 2, height / 2 - 80).setDepth(200);
        const alertBg = this.add.graphics();
        alertBg.fillStyle(0x0f172a, 0.96);
        alertBg.lineStyle(3, 0x38bdf8);
        alertBg.fillRoundedRect(-330, -50, 660, 100, 16);
        alertBg.strokeRoundedRect(-330, -50, 660, 100, 16);

        const titleText = type === 'iltassafy'
            ? '🎱 [중간 힐링 타임] 일타싸피 알고리즘 세션! 🎱'
            : '⚔️ [중간 힐링 타임] 배틀싸피 전차전 알고리즘 세션! ⚔️';

        const alertTitle = this.add.text(0, -15, titleText, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '22px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const alertSub = this.add.text(0, 20, '🧩 지친 손가락을 쉬어가세요! 블록 코딩으로 보스를 격파하라!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#facc15'
        }).setOrigin(0.5);

        alertContainer.add([alertBg, alertTitle, alertSub]);
        alertContainer.setScale(0);

        this.tweens.add({
            targets: alertContainer,
            scale: 1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1100, () => {
                    this.tweens.add({
                        targets: alertContainer,
                        alpha: 0,
                        scale: 0.8,
                        duration: 250,
                        onComplete: () => {
                            alertContainer.destroy();

                            // Pause runner and launch Block Coding Mini-game
                            this.isPaused = true;
                            (this.player.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0);

                            new BlockCodingModal(this, type, this.audioManager, (scoreBonus, coinBonus) => {
                                this.bossDefeatedList.add(type);
                                this.score += scoreBonus;
                                this.coinsCollected += coinBonus;
                                this.scoreText.setText(this.score.toLocaleString());
                                this.coinText.setText(this.coinsCollected.toString());

                                // Full heal 100%
                                this.currentHp = this.maxHp;
                                this.updateHpBar();

                                // Resume runner with Golden Fever Mode
                                this.isPaused = false;
                                this.isBossActive = false;
                                this.startFeverMode();

                                // Floating celebratory notice
                                const floatText = this.add.text(this.player.x, this.player.y - 70, '✨ 멘탈 100% 완전 회복! 골든 피버 질주! ✨', {
                                    fontFamily: '"Black Han Sans", sans-serif',
                                    fontSize: '22px',
                                    color: '#4ade80'
                                }).setDepth(50);

                                this.tweens.add({
                                    targets: floatText,
                                    y: floatText.y - 50,
                                    alpha: 0,
                                    duration: 1600,
                                    onComplete: () => floatText.destroy()
                                });
                            });
                        }
                    });
                });
            }
        });
    }

    private createBossHUD(type: 'iltassafy' | 'battlessafy') {
        const { width } = this.scale;
        this.bossHpContainer = this.add.container(width / 2, 58).setDepth(60);

        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.9);
        bg.lineStyle(2, 0xef4444);
        bg.fillRoundedRect(-150, -22, 300, 44, 10);
        bg.strokeRoundedRect(-150, -22, 300, 44, 10);

        const nameLabel = type === 'iltassafy' ? '🎱 일타싸피 AI BOSS' : '⚔️ 배틀싸피 TANK BOSS';
        this.bossHpText = this.add.text(0, -9, `${nameLabel} - 100%`, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#facc15'
        }).setOrigin(0.5);

        this.bossHpFill = this.add.graphics();
        this.renderBossHpBar();

        this.bossHpContainer.add([bg, this.bossHpFill, this.bossHpText]);
    }

    private renderBossHpBar() {
        if (!this.bossHpFill) return;
        this.bossHpFill.clear();

        const barW = 260;
        const barH = 10;
        const bx = -barW / 2;
        const by = 4;

        // Background
        this.bossHpFill.fillStyle(0x1e293b, 1);
        this.bossHpFill.fillRoundedRect(bx, by, barW, barH, 3);

        // Fill
        const ratio = Math.max(0, this.bossHp / this.bossMaxHp);
        const color = ratio > 0.5 ? 0xef4444 : 0xf97316;
        this.bossHpFill.fillStyle(color, 1);
        if (ratio > 0) {
            this.bossHpFill.fillRoundedRect(bx, by, barW * ratio, barH, 3);
        }
    }

    private updateBoss(deltaSec: number, delta: number) {
        if (!this.bossSprite || !this.isBossActive) return;

        // Boss Attack Timer
        this.bossAttackTimer -= delta;
        if (this.bossAttackTimer <= 0) {
            this.executeBossAttack();
            this.bossAttackTimer = Phaser.Math.Between(2200, 3000);
        }

        // Spawn Debug Patches (Counters)
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
                // Bouncing cue ball
                const ball = this.bossProjectiles.create(bx, by, 'boss_projectile_ball') as Phaser.Physics.Arcade.Sprite;
                ball.setDepth(16);
                const bbody = ball.body as Phaser.Physics.Arcade.Body;
                if (bbody) {
                    bbody.setAllowGravity(true);
                    bbody.setBounce(0.9, 0.85);
                    bbody.setVelocityX(-this.currentSpeed * 1.35);
                    bbody.setVelocityY(-200);
                    bbody.setSize(30, 30);
                }
                this.physics.add.collider(ball, this.groundColliderGroup);
            } else {
                // Low altitude laser cue - requires slide!
                const cue = this.obstacles.create(width + 100, this.groundY - 55, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
                cue.setDepth(16);
                const cbody = cue.body as Phaser.Physics.Arcade.Body;
                if (cbody) {
                    cbody.setAllowGravity(false);
                    cbody.setVelocityX(-this.currentSpeed * 1.3);
                    cbody.setSize(58, 22);
                }
            }
        } else {
            // Battle SSAFY Tank Shell
            const isHigh = Phaser.Math.Between(0, 1) === 1;
            const shellY = isHigh ? this.groundY - 75 : this.groundY - 26;
            const shell = this.bossProjectiles.create(bx, shellY, 'boss_projectile_shell') as Phaser.Physics.Arcade.Sprite;
            shell.setDepth(16);
            const sbody = shell.body as Phaser.Physics.Arcade.Body;
            if (sbody) {
                sbody.setAllowGravity(false);
                sbody.setVelocityX(-this.currentSpeed * 1.45);
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

        // Bobbing sparkle
        this.tweens.add({
            targets: patch,
            scale: 1.15,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    private collectDebugPatch(patch: Phaser.Physics.Arcade.Sprite) {
        patch.destroy();
        this.audioManager.playBossHit();
        this.score += 300;
        this.scoreText.setText(this.score.toLocaleString());

        // Homing energy bolt from player to boss
        if (this.bossSprite && this.isBossActive) {
            const bolt = this.add.graphics().setDepth(25);
            bolt.lineStyle(3, 0x38bdf8, 1);
            bolt.lineBetween(this.player.x, this.player.y - 30, this.bossSprite.x, this.bossSprite.y);
            this.time.delayedCall(100, () => bolt.destroy());

            // Boss hit reaction
            this.bossHp -= 25;
            this.cameras.main.shake(80, 0.01);
            this.bossSprite.setTint(0xffffff);
            this.time.delayedCall(120, () => this.bossSprite?.clearTint());

            // Floating Critical Hit text
            const floatText = this.add.text(this.bossSprite.x - 30, this.bossSprite.y - 40, '💥 -25 HP!', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '18px',
                color: '#facc15',
                stroke: '#0f172a',
                strokeThickness: 3
            }).setDepth(35);
            this.tweens.add({ targets: floatText, y: floatText.y - 30, alpha: 0, duration: 500, onComplete: () => floatText.destroy() });

            // Update Boss HUD
            const nameLabel = this.currentBossType === 'iltassafy' ? '🎱 일타싸피 AI BOSS' : '⚔️ 배틀싸피 TANK BOSS';
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

        this.currentHp -= 20;
        this.combo = 0;
        this.comboText.setText('');
        this.cameras.main.shake(120, 0.015);

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
        }
    }

    private defeatBoss() {
        this.audioManager.playBossDefeat();
        this.cameras.main.shake(300, 0.03);

        if (this.currentBossType) {
            this.bossDefeatedList.add(this.currentBossType);
        }

        const bx = this.bossSprite ? this.bossSprite.x : this.scale.width - 150;
        const by = this.bossSprite ? this.bossSprite.y : this.groundY - 100;

        // Explode boss
        if (this.bossSprite) {
            this.tweens.add({
                targets: this.bossSprite,
                scale: 1.4,
                alpha: 0,
                duration: 400,
                onComplete: () => this.bossSprite?.destroy()
            });
        }

        // Shower of 15 Gold Coins!
        for (let i = 0; i < 15; i++) {
            const coin = this.jellies.create(bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-60, 60), 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(coin, 50, 'coin');
            const cbody = coin.body as Phaser.Physics.Arcade.Body;
            if (cbody) {
                cbody.setVelocity(Phaser.Math.Between(-250, -50), Phaser.Math.Between(-300, 50));
            }
        }

        // Defeat Banner Announcement
        const { width, height } = this.scale;
        const passBanner = this.add.container(width / 2, height / 2 - 80).setDepth(160);
        const passBg = this.add.graphics();
        passBg.fillStyle(0x0f172a, 0.96);
        passBg.lineStyle(3, 0xfacc15);
        passBg.fillRoundedRect(-300, -40, 600, 80, 16);
        passBg.strokeRoundedRect(-300, -40, 600, 80, 16);

        const passText = this.add.text(0, -8, '🏆 EVALUATION PASSED! [PASS A+]', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '24px',
            color: '#facc15'
        }).setOrigin(0.5);

        const bonusText = this.add.text(0, 20, '+5,000 PTS & FEVER MODE ACTIVATED!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        passBanner.add([passBg, passText, bonusText]);
        passBanner.setScale(0);

        this.tweens.add({
            targets: passBanner,
            scale: 1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: passBanner,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => passBanner.destroy()
                    });
                });
            }
        });

        // Add 5,000 points & start Fever mode!
        this.score += 5000;
        this.scoreText.setText(this.score.toLocaleString());
        this.startFeverMode();

        // Clean up boss HUD
        this.bossHpContainer?.destroy();
        this.bossHpContainer = undefined;
        this.isBossActive = false;
        this.nextWaveTimer = 1500;
    }

    // Temporary Magnetic Attraction
    private applyMagneticAttraction() {
        const magnetRadius = this.isFeverActive ? 280 : 180;
        const px = this.player.x;
        const py = this.player.y - 32;

        this.jellies.getChildren().forEach((child) => {
            const j = child as Phaser.Physics.Arcade.Sprite;
            if (!j.active) return;
            const dist = Phaser.Math.Distance.Between(px, py, j.x, j.y);
            if (dist < magnetRadius) {
                const angle = Phaser.Math.Angle.Between(j.x, j.y, px, py);
                j.x += Math.cos(angle) * 600 * 0.016;
                j.y += Math.sin(angle) * 600 * 0.016;
            }
        });

        this.items.getChildren().forEach((child) => {
            const item = child as Phaser.Physics.Arcade.Sprite;
            if (!item.active) return;
            const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
            if (dist < magnetRadius) {
                const angle = Phaser.Math.Angle.Between(item.x, item.y, px, py);
                item.x += Math.cos(angle) * 520 * 0.016;
                item.y += Math.sin(angle) * 520 * 0.016;
            }
        });
    }

    private spawnNextWave() {
        const patterns = [0, 1, 2, 3, 4, 5, 6];
        const available = patterns.filter(p => p !== this.lastPatternIndex);
        const selected = Phaser.Math.RND.pick(available);
        this.lastPatternIndex = selected;

        let waveDurationMs = 2000;

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
        }

        this.nextWaveTimer = Math.max(1600, waveDurationMs * (440 / this.currentSpeed));
        this.waveCount++;

        // Spawn S-S-A-F-Y Alphabet Capsule every 2 waves (if Arcade/Ultimate enabled)
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

    // AI Companion Bit-Drone Autonomous Assist (Shield Recharge OR Orbital Laser Obstacle Snipe!)
    private triggerDroneAutonomousAssist() {
        const dronePos = this.player.getDronePosition();

        // 1. If player's shield is broken, priority is recharging the Hexagonal Plasma Shield!
        if (!this.player.hasShield) {
            this.player.activateShield();
            this.audioManager.playMagnet();
            const txt = this.add.text(dronePos.x, dronePos.y - 24, '🤖 AI DRONE: 쉴드 재충전!', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '16px',
                color: '#22d3ee',
                stroke: '#0f172a',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(60);
            this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
            return;
        }

        // 2. Otherwise, lock onto the closest incoming obstacle on screen and vaporize it with an Orbital Laser!
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
            beam.lineStyle(5, 0x22d3ee, 0.95);
            beam.beginPath();
            beam.moveTo(dronePos.x + 12, dronePos.y);
            beam.lineTo(obs.x, obs.y);
            beam.strokePath();
            beam.lineStyle(2, 0xffffff, 1);
            beam.beginPath();
            beam.moveTo(dronePos.x + 12, dronePos.y);
            beam.lineTo(obs.x, obs.y);
            beam.strokePath();

            this.tweens.add({
                targets: beam,
                alpha: 0,
                duration: 240,
                onComplete: () => beam.destroy()
            });

            const bonus = Math.round(350 * this.scoreBonusMultiplier);
            this.score += bonus;
            this.scoreText.setText(this.score.toLocaleString());

            const pop = this.add.text(obs.x, obs.y - 10, `🤖 드론 요격! +${bonus}`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '18px',
                color: '#22d3ee',
                stroke: '#0f172a',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(55);
            this.tweens.add({ targets: pop, y: pop.y - 45, alpha: 0, duration: 650, onComplete: () => pop.destroy() });

            obs.destroy();
        }
    }

    // Pattern 0: Gold Coin Sprint (🪙)
    private spawnCoinSprintWave(): number {
        const { width } = this.scale;
        for (let i = 0; i < 6; i++) {
            const c = this.jellies.create(width + (i * 45), this.groundY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }
        return 1700;
    }

    // Pattern 1: Jump Arc over obstacle
    private spawnJumpArcWave(): number {
        const { width } = this.scale;
        const obstacleX = width + 240;

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
            { x: -160, y: -30 }, { x: -105, y: -65 }, { x: -50, y: -95 },
            { x: 0, y: -105 }, { x: 50, y: -95 }, { x: 105, y: -65 }, { x: 160, y: -30 }
        ];

        arcOffsets.forEach(pt => {
            const j = this.jellies.create(obstacleX + pt.x, this.groundY + pt.y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 2200;
    }

    // Pattern 2: Slide Tunnel under conflict banner
    private spawnSlideTunnelWave(): number {
        const { width } = this.scale;
        const barrierX = width + 220;

        const obs = this.obstacles.create(barrierX, this.groundY - 68, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(58, 22);
        }

        for (let i = -110; i <= 110; i += 45) {
            const j = this.jellies.create(barrierX + i, this.groundY - 18, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        }

        return 2000;
    }

    // Pattern 3: Floating Upper Platform with Gold Coins (2-tier aerial path!)
    private spawnFloatingPlatformWave(): number {
        const { width } = this.scale;
        const platX = width + 200;
        const platY = this.groundY - 95;

        // Platform
        const plat = this.floatingPlatforms.create(platX, platY, 'platform_tex') as Phaser.Physics.Arcade.Sprite;
        plat.setDepth(12);
        const body = plat.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setImmovable(true);
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(160, 24);
        }

        // Coins on top of platform
        for (let i = -60; i <= 60; i += 40) {
            const c = this.jellies.create(platX + i, platY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }

        // Ground obstacle underneath
        const obs = this.obstacles.create(platX, this.groundY - 24, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const obody = obs.body as Phaser.Physics.Arcade.Body;
        if (obody) {
            obody.setAllowGravity(false);
            obody.setVelocityX(-this.currentSpeed);
        }

        return 2200;
    }

    // Pattern 4: Magnet Power-Up Item (🧲)
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

        // Gold coin trail behind magnet
        for (let i = 1; i <= 5; i++) {
            const c = this.jellies.create(width + 180 + (i * 45), this.groundY - 32, 'item_coin') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(c, 50, 'coin');
        }

        return 1900;
    }

    // Pattern 5: High Double Jump QR Code Phone
    private spawnDoubleJumpQrWave(): number {
        const { width } = this.scale;
        const centerX = width + 250;

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

        const guides = [{ x: -130, y: -40 }, { x: -70, y: -90 }, { x: 70, y: -90 }, { x: 130, y: -40 }];
        guides.forEach(g => {
            const j = this.jellies.create(centerX + g.x, this.groundY + g.y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 2200;
    }

    // Pattern 6: Coffee break & Health refill
    private spawnCoffeeRestWave(): number {
        const { width } = this.scale;
        const coffeeX = width + 200;

        const coffee = this.items.create(coffeeX, this.groundY - 60, 'item_coffee') as Phaser.Physics.Arcade.Sprite;
        coffee.setDepth(16);
        const body = coffee.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
        }
        coffee.setData('type', 'coffee');

        [-80, -40, 40, 80].forEach(ox => {
            const j = this.jellies.create(coffeeX + ox, this.groundY - 32, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 1800;
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

        // Top Left: HP Bar & Stage Badge
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

        // Magnet Power-up timer text under HP bar
        this.magnetHudText = this.add.text(barX, barY + 26, '🧲 MAGNET: 6.0s', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '13px',
            color: '#38bdf8'
        }).setDepth(50).setVisible(false);

        // S-S-A-F-Y Alphabet Bonus Tracker & Hyper Dash Button (Arcade/Ultimate Edition)
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

            this.dashHudText = this.add.text(barX, barY + 84, '⚡ [Shift / 클릭] HYPER DASH 준비완료!', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '13px',
                color: '#22d3ee',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                padding: { x: 8, y: 4 }
            }).setDepth(55).setInteractive({ useHandCursor: true });

            this.dashHudText.on('pointerdown', () => {
                this.events.emit('request-hyper-dash');
            });
        }

        // Top Center: Distance & Coins & Fever (or Stage Goal Progress in Stage Mode)
        if (this.gameMode === 'stage') {
            this.stageGoalText = this.add.text(width / 2, 20, `🚩 STAGE ${this.currentStageId} : 0m / ${this.targetDistance}m`, {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '16px',
                color: '#38bdf8'
            }).setOrigin(0.5, 0).setDepth(50);

            this.stageProgressBar = this.add.graphics().setDepth(50);
            this.renderStageProgressBar();

            this.coinText = this.add.text(width / 2 + 155, 20, '🪙 0', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '18px',
                color: '#facc15'
            }).setOrigin(0, 0).setDepth(50);

            this.distanceText = this.add.text(0, 0, '', {}).setVisible(false);
        } else {
            this.distanceText = this.add.text(width / 2 - 50, 24, '📍 0m', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '20px',
                color: '#38bdf8'
            }).setOrigin(0.5, 0).setDepth(50);

            this.coinText = this.add.text(width / 2 + 55, 24, '🪙 0', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '20px',
                color: '#facc15'
            }).setOrigin(0.5, 0).setDepth(50);
        }

        this.feverText = this.add.text(width / 2, 54, '🔥 FEVER TIME! DOUBLE POINTS 🔥', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#facc15'
        }).setOrigin(0.5, 0).setDepth(50).setVisible(false);

        this.feverBar = this.add.graphics().setDepth(50).setVisible(false);

        // Top Right: Score & Best & Combo & Pause Button
        this.scoreText = this.add.text(width - 110, 20, '0', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(1, 0).setDepth(50);

        this.add.text(width - 110, 56, `BEST: ${this.highScore.toLocaleString()}`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(1, 0).setDepth(50);

        this.comboText = this.add.text(width - 110, 80, '', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#f97316'
        }).setOrigin(1, 0).setDepth(50);

        // Pause Button
        const pauseBtn = this.add.container(width - 45, 42).setDepth(50);
        const pauseBg = this.add.graphics();
        pauseBg.fillStyle(0x0f172a, 0.85);
        pauseBg.lineStyle(2, 0x38bdf8);
        pauseBg.fillCircle(0, 0, 22);
        pauseBg.strokeCircle(0, 0, 22);

        const pauseIcon = this.add.text(0, 0, '❚❚', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        pauseBtn.add([pauseBg, pauseIcon]);
        pauseBtn.setSize(44, 44);
        pauseBtn.setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', () => this.togglePause());
    }

    private renderHpBar() {
        const hpRatio = Phaser.Math.Clamp(this.currentHp / this.maxHp, 0, 1);
        this.hpBarFill.clear();

        let barColor = 0x22c55e;
        if (hpRatio < 0.28) {
            barColor = 0xef4444;
            if (Math.floor(Date.now() / 250) % 2 === 0) barColor = 0xb91c1c;
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

        this.feverBar.fillStyle(0xfacc15, 1);
        this.feverBar.fillRoundedRect(bx, by, barW * ratio, barH, 3);
    }

    private startFeverMode() {
        this.isFeverActive = true;
        this.feverTimeRemaining = 5.5;
        this.player.setFever(true);
        this.audioManager.playFever();

        this.feverText.setVisible(true);
        this.feverBar.setVisible(true);

        this.cameras.main.flash(200, 255, 230, 100);
    }

    private endFeverMode() {
        this.isFeverActive = false;
        this.player.setFever(false);
        this.feverText.setVisible(false);
        this.feverBar.setVisible(false);
    }

    private collectJelly(jelly: Phaser.Physics.Arcade.Sprite) {
        let points = jelly.getData('points') || 100;
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
            this.comboText.setText(`🔥 ${this.combo} COMBO! (x${multiplier})`);
            this.comboText.setScale(1.2);
            this.tweens.add({ targets: this.comboText, scale: 1.0, duration: 150 });
        } else {
            this.comboText.setText('');
        }

        const floatColor = type === 'coin' ? '#facc15' : type === 'qr' ? '#38bdf8' : this.isFeverActive ? '#facc15' : '#4ade80';
        const floatText = this.add.text(jelly.x, jelly.y, `+${totalEarned}`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: floatColor
        }).setDepth(30);

        this.tweens.add({
            targets: floatText,
            y: floatText.y - 45,
            alpha: 0,
            duration: 500,
            onComplete: () => floatText.destroy()
        });

        if (this.textures.exists('particle_sparkle')) {
            const sparkles = this.add.particles(jelly.x, jelly.y, 'particle_sparkle', {
                speed: { min: 30, max: 80 },
                scale: { start: 0.8, end: 0 },
                lifespan: 250,
                quantity: 4
            });
            this.time.delayedCall(250, () => sparkles.destroy());
        }

        jelly.destroy();
    }

    private collectSpecialItem(item: Phaser.Physics.Arcade.Sprite) {
        const type = item.getData('type');

        if (type === 'magnet') {
            // Temporary 6.5s magnet power-up!
            this.player.activateMagnet(6.5);
            const floatText = this.add.text(item.x, item.y, '🧲 MAGNET ON!', {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#38bdf8'
            }).setDepth(30);
            this.tweens.add({ targets: floatText, y: floatText.y - 50, alpha: 0, duration: 600, onComplete: () => floatText.destroy() });
        } else if (type === 'coffee') {
            this.coffeeCount++;
            this.currentHp = Math.min(this.maxHp, this.currentHp + 25);
            this.renderHpBar();
            this.audioManager.playCoffee();

            const floatText = this.add.text(item.x, item.y, '+25 HP 회복!', {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#38bdf8'
            }).setDepth(30);
            this.tweens.add({ targets: floatText, y: floatText.y - 50, alpha: 0, duration: 600, onComplete: () => floatText.destroy() });
        } else if (type === 'fever') {
            this.startFeverMode();
            const floatText = this.add.text(item.x, item.y, '⚡ FEVER BOOST!!', {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#facc15'
            }).setDepth(30);
            this.tweens.add({ targets: floatText, y: floatText.y - 50, alpha: 0, duration: 600, onComplete: () => floatText.destroy() });
        } else if (type === 'letter') {
            const idx = item.getData('letterIndex') ?? 0;
            this.collectedLetters[idx] = true;
            this.audioManager.playQr();
            if (this.letterHudTexts[idx]) {
                this.letterHudTexts[idx].setColor('#facc15');
                this.letterHudTexts[idx].setScale(1.35);
                this.tweens.add({ targets: this.letterHudTexts[idx], scale: 1.0, duration: 220 });
            }
            const letterBonus = Math.round(300 * this.scoreBonusMultiplier);
            this.score += letterBonus;
            this.scoreText.setText(this.score.toLocaleString());

            // Check if all 5 S-S-A-F-Y letters are collected!
            if (this.collectedLetters.every(v => v)) {
                this.triggerSsafyBonusTime();
            } else {
                const floatText = this.add.text(item.x, item.y, `🔤 알파벳 획득! +${letterBonus}`, {
                    fontFamily: 'Arial Black',
                    fontSize: '18px',
                    color: '#facc15'
                }).setDepth(30);
                this.tweens.add({ targets: floatText, y: floatText.y - 45, alpha: 0, duration: 550, onComplete: () => floatText.destroy() });
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

        const { width, height } = this.scale;
        const banner = this.add.container(width / 2, height / 2 - 70).setDepth(180);
        const bg = this.add.graphics();
        bg.fillStyle(0x090d16, 0.95);
        bg.lineStyle(3, 0xfacc15);
        bg.fillRoundedRect(-290, -45, 580, 90, 18);
        bg.strokeRoundedRect(-290, -45, 580, 90, 18);

        const title = this.add.text(0, -12, '🌈 S·S·A·F·Y HYPER BONUS TIME! 🌈', {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '24px',
            color: '#facc15'
        }).setOrigin(0.5);
        const sub = this.add.text(0, 18, `+${bonusScore.toLocaleString()}점 · 🪙 +25 코인 · ❤️ +35 HP · 🛡️ 쉴드 충전!`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '16px',
            color: '#22d3ee'
        }).setOrigin(0.5);

        banner.add([bg, title, sub]);
        banner.setScale(0);
        this.tweens.add({
            targets: banner,
            scale: 1,
            duration: 320,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1800, () => {
                    this.tweens.add({
                        targets: banner,
                        alpha: 0,
                        duration: 280,
                        onComplete: () => banner.destroy()
                    });
                });
            }
        });
    }

    private handleHitObstacle(obs: Phaser.Physics.Arcade.Sprite) {
        if (this.isFeverActive || this.player.isDashing) {
            const smashBonus = Math.round(500 * this.scoreBonusMultiplier);
            this.score += smashBonus;
            this.scoreText.setText(this.score.toLocaleString());

            const floatText = this.add.text(obs.x, obs.y, `⚡ +${smashBonus} 격파!`, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#facc15'
            }).setDepth(30);
            this.tweens.add({ targets: floatText, y: floatText.y - 40, alpha: 0, duration: 500, onComplete: () => floatText.destroy() });

            this.cameras.main.shake(80, 0.01);
            obs.destroy();
            return;
        }

        // Hexagonal Plasma Shield Protection (Blocks 1 Hit & Preserves Combo!)
        if (this.player.hasShield) {
            this.player.breakShield();
            this.cameras.main.flash(200, 34, 211, 238);
            const shieldText = this.add.text(this.player.x, this.player.y - 60, '🛡️ SHIELD GUARD! (방어 성공)', {
                fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
                fontSize: '19px',
                color: '#22d3ee',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(60);
            this.tweens.add({ targets: shieldText, y: shieldText.y - 45, alpha: 0, duration: 750, onComplete: () => shieldText.destroy() });
            obs.destroy();
            return;
        }

        const hitSuccess = this.player.hit();
        if (!hitSuccess) return;

        // Cleanly dissipate the obstacle so it never pushes the player off-screen
        obs.disableBody(true, false);
        this.tweens.add({
            targets: obs,
            alpha: 0,
            y: obs.y - 20,
            duration: 220,
            onComplete: () => obs.destroy()
        });

        this.currentHp -= 20;
        this.combo = 0;
        this.comboText.setText('');
        this.cameras.main.shake(120, 0.015);

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
        panel.fillStyle(0x0f172a, 0.95);
        panel.lineStyle(2, 0x38bdf8);
        panel.fillRoundedRect(width / 2 - 160, height / 2 - 140, 320, 280, 16);
        panel.strokeRoundedRect(width / 2 - 160, height / 2 - 140, 320, 280, 16);
        this.pauseContainer.add(panel);

        const title = this.add.text(width / 2, height / 2 - 95, '⏸ 일시 정지', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
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

        const menuBtn = this.createPauseBtn(width / 2, height / 2 + 85, '메인 메뉴 (MENU)', () => {
            this.pauseContainer?.destroy();
            this.audioManager.stopBgm();
            this.scene.start('MainMenu');
        });

        this.pauseContainer.add([resumeBtn, restartBtn, menuBtn]);
    }

    private createPauseBtn(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.9);
        bg.lineStyle(1, 0x38bdf8);
        bg.fillRoundedRect(-120, -18, 240, 36, 8);
        bg.strokeRoundedRect(-120, -18, 240, 36, 8);

        const txt = this.add.text(0, 0, label, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Auto-scale text if it exceeds button width
        if (txt.width > 220) {
            txt.setScale(220 / txt.width);
        }

        container.add([bg, txt]);
        container.setSize(240, 36);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', onClick);

        return container;
    }

    private triggerGameOver() {
        this.physics.pause();
        this.audioManager.stopBgm();
        this.audioManager.playGameOver();

        // Save earned coins to player wallet
        SkinManager.addCoins(this.coinsCollected);

        this.cameras.main.fade(400, 10, 14, 26);
        this.time.delayedCall(400, () => {
            this.scene.start('GameOver', {
                score: this.score,
                distance: Math.floor(this.distance),
                commits: this.commitCount,
                qrs: this.qrCount,
                coffees: this.coffeeCount,
                coins: this.coinsCollected
            });
        });
    }

    // --- Stage Mode (1~30) Logic ---
    private updateStageProgressHUD() {
        if (!this.stageGoalText || this.targetDistance <= 0) return;
        const currentM = Math.min(this.targetDistance, Math.floor(this.distance));
        this.stageGoalText.setText(`🚩 STAGE ${this.currentStageId} : ${currentM}m / ${this.targetDistance}m`);
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

        // Background
        this.stageProgressBar.fillStyle(0x0f172a, 0.85);
        this.stageProgressBar.fillRoundedRect(bx, by, barW, barH, 4);

        // Progress fill
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
        this.cameras.main.flash(350, 74, 222, 128);

        // Calculate Star Rating
        let stars = 1;
        if (this.currentHp >= 75) stars = 3;
        else if (this.currentHp >= 40) stars = 2;

        // Save progress & unlock next stage
        StageManager.saveStageProgress(this.currentStageId, stars, this.score);
        SkinManager.addCoins(this.coinsCollected);

        // Stop physics
        this.physics.pause();
        this.audioManager.stopBgm();

        // Confetti explosion
        if (this.textures.exists('particle_sparkle')) {
            const confetti = this.add.particles(this.scale.width / 2, this.scale.height / 2 - 50, 'particle_sparkle', {
                speed: { min: 100, max: 320 },
                scale: { start: 1.2, end: 0 },
                quantity: 40,
                lifespan: 1200
            });
            this.time.delayedCall(1200, () => confetti.destroy());
        }

        // Show Stage Clear Modal
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
        const cardH = 440;
        const panel = this.add.graphics();
        panel.fillStyle(0x0f172a, 0.98);
        panel.lineStyle(3, 0xfacc15);
        panel.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        panel.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
        this.stageClearContainer.add(panel);

        const title = this.add.text(0, -cardH / 2 + 50, `🏆 STAGE ${this.currentStageId} CLEAR!`, {
            fontFamily: '"Black Han Sans", "Permanent Marker", sans-serif',
            fontSize: '32px',
            color: '#facc15',
            stroke: '#0f172a',
            strokeThickness: 6
        }).setOrigin(0.5);

        const subtitle = this.add.text(0, -cardH / 2 + 92, this.currentStageConfig ? this.currentStageConfig.title : 'SSAFY 알고리즘 과제 완주!', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '17px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        // Animated Stars
        const starsText = stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐☆' : '⭐☆☆';
        const starsLabel = this.add.text(0, -cardH / 2 + 145, starsText, {
            fontSize: '44px'
        }).setOrigin(0.5);

        // Stats Box
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

        const coinStat = this.add.text(105, 8, `획득 코인: 🪙 +${this.coinsCollected}`, {
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

        // Action Buttons
        const btnY = cardH / 2 - 50;

        if (this.currentStageId < 30) {
            const nextBtn = this.createPauseBtn(-125, btnY, `▶ 다음 단계 (STAGE ${this.currentStageId + 1})`, () => {
                this.stageClearContainer?.destroy();
                this.scene.restart({ mode: 'stage', stageId: this.currentStageId + 1 });
            });
            nextBtn.setSize(220, 44);
            this.stageClearContainer.add(nextBtn);

            const mapBtn = this.createPauseBtn(125, btnY, '🗺️ 스테이지 맵', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('StageSelect');
            });
            mapBtn.setSize(180, 44);
            this.stageClearContainer.add(mapBtn);
        } else {
            const congrats = this.add.text(0, 105, '🎉 축하합니다! SSAFY 30개 전 단계를 마스터하셨습니다! 🎓', {
                fontFamily: '"Do Hyeon", sans-serif',
                fontSize: '16px',
                color: '#facc15'
            }).setOrigin(0.5);
            this.stageClearContainer.add(congrats);

            const mapBtn = this.createPauseBtn(0, btnY, '🗺️ 스테이지 맵으로 복귀', () => {
                this.stageClearContainer?.destroy();
                this.scene.start('StageSelect');
            });
            mapBtn.setSize(250, 46);
            this.stageClearContainer.add(mapBtn);
        }
    }
}
