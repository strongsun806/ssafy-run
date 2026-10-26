import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { AudioManager } from '../utils/AudioManager';
import { ScoreManager } from '../utils/ScoreManager';

export class Game extends Scene {
    private player!: Player;
    private groundTile!: Phaser.GameObjects.TileSprite;
    private groundCollider!: Phaser.Physics.Arcade.StaticGroup;

    // Parallax layers
    private bgFarTile!: Phaser.GameObjects.TileSprite;
    private bgNearTile!: Phaser.GameObjects.TileSprite;

    // Object groups
    private obstacles!: Phaser.Physics.Arcade.Group;
    private jellies!: Phaser.Physics.Arcade.Group;
    private items!: Phaser.Physics.Arcade.Group;

    private groundY: number = 0;
    private baseSpeed: number = 480;
    private currentSpeed: number = 480;
    private distance: number = 0;

    // Mental HP
    private maxHp: number = 100;
    private currentHp: number = 100;
    private hpBarFill!: Phaser.GameObjects.Graphics;
    private hpDrainRate: number = 2.2;

    // Score & Stats
    public score: number = 0;
    private highScore: number = 0;
    private combo: number = 0;
    private commitCount: number = 0;
    private qrCount: number = 0;
    private coffeeCount: number = 0;

    // Fever Mode
    private isFeverActive: boolean = false;
    private feverTimeRemaining: number = 0;
    private feverBar!: Phaser.GameObjects.Graphics;
    private feverText!: Phaser.GameObjects.Text;

    // HUD Elements
    private scoreText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private hpText!: Phaser.GameObjects.Text;

    // Orchestrated Wave Spawner
    private nextWaveTimer: number = 0;
    private lastPatternIndex: number = -1;

    // Pause & Audio
    private isPaused: boolean = false;
    private pauseContainer?: Phaser.GameObjects.Container;
    private audioManager: AudioManager;

    // Mobile Visual Buttons
    private jumpBtn?: Phaser.GameObjects.Image;
    private slideBtn?: Phaser.GameObjects.Image;

    constructor() {
        super('Game');
        this.audioManager = AudioManager.getInstance();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(300, 10, 14, 26);

        // Reset state
        this.currentSpeed = this.baseSpeed;
        this.distance = 0;
        this.score = 0;
        this.currentHp = 100;
        this.combo = 0;
        this.commitCount = 0;
        this.qrCount = 0;
        this.coffeeCount = 0;
        this.isFeverActive = false;
        this.feverTimeRemaining = 0;
        this.isPaused = false;
        this.nextWaveTimer = 800; // First wave after 0.8s
        this.highScore = ScoreManager.getHighScore();

        // 1. Sky & Parallax Background
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x1e1b4b, 0x311042, 1);
        sky.fillRect(0, 0, width, height);

        this.groundY = height - 50;

        if (this.textures.exists('bg_skyline_far')) {
            this.bgFarTile = this.add.tileSprite(0, height - 350, width, 400, 'bg_skyline_far')
                .setOrigin(0, 0)
                .setAlpha(0.55);
        }

        if (this.textures.exists('bg_skyline_near')) {
            this.bgNearTile = this.add.tileSprite(0, height - 230, width, 280, 'bg_skyline_near')
                .setOrigin(0, 0)
                .setAlpha(0.85);
        }

        // 2. Ground
        this.groundTile = this.add.tileSprite(0, this.groundY, width, 60, 'ground_tex')
            .setOrigin(0, 0)
            .setDepth(10);

        this.groundCollider = this.physics.add.staticGroup();
        const groundBody = this.add.rectangle(width / 2, this.groundY + 20, width * 2, 40, 0x000000, 0);
        this.groundCollider.add(groundBody);

        // 3. Player
        this.player = new Player(this, 180, this.groundY, this.groundY).setDepth(20);
        this.physics.add.collider(this.player, this.groundCollider, () => {
            if (this.player.body && (this.player.body.blocked.down || this.player.body.touching.down)) {
                this.player.resetJump();
            }
        });

        // 4. Object Groups & Overlaps
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

        // 5. HUD
        this.createHUD();

        // 6. Responsive Mobile Touch Controls (Split screen + on-screen buttons)
        this.setupTouchControls();

        // 7. Keyboard Listeners
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-P', () => this.togglePause());
            this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        }

        // Start BGM
        this.audioManager.startBgm();
    }

    private setupTouchControls() {
        const { width, height } = this.scale;

        // Visual Buttons
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

        // Screen-Split Multi-touch Zone (Left half = Slide, Right half = Jump)
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPaused) return;

            // Ignore pause button area (top right)
            if (pointer.x > width - 80 && pointer.y < 80) return;

            if (pointer.x < width / 2) {
                // Left half: Slide
                this.player.setTouchSlide(true);
                this.slideBtn?.setAlpha(1.0).setScale(0.92);
            } else {
                // Right half: Jump
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
        if (this.isPaused) return;

        const deltaSec = delta / 1000;

        // Distance & Speed Progression
        this.distance += (this.currentSpeed * deltaSec) / 10;
        this.currentSpeed = Math.min(840, this.baseSpeed + Math.floor(this.distance * 0.28));

        // Parallax background scrolling
        if (this.bgFarTile) this.bgFarTile.tilePositionX += (this.currentSpeed * 0.12) * deltaSec;
        if (this.bgNearTile) this.bgNearTile.tilePositionX += (this.currentSpeed * 0.35) * deltaSec;
        if (this.groundTile) this.groundTile.tilePositionX += this.currentSpeed * deltaSec;

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

        // Orchestrated wave generator
        this.nextWaveTimer -= delta;
        if (this.nextWaveTimer <= 0) {
            this.spawnNextWave();
        }

        // Player update with snappy input buffer
        this.player.update(_time, delta);

        // Update HUD
        this.distanceText.setText(`📍 ${Math.floor(this.distance)}m 질주 중`);

        // Clean off-screen objects
        this.cleanOffscreen(this.obstacles);
        this.cleanOffscreen(this.jellies);
        this.cleanOffscreen(this.items);
    }

    // Choreographed Wave Generation
    private spawnNextWave() {
        const patterns = [0, 1, 2, 3, 4, 5];
        // Avoid repeating the exact same pattern consecutively
        const available = patterns.filter(p => p !== this.lastPatternIndex);
        const selected = Phaser.Math.RND.pick(available);
        this.lastPatternIndex = selected;

        let waveDurationMs = 2000;

        switch (selected) {
            case 0:
                waveDurationMs = this.spawnRunWave();
                break;
            case 1:
                waveDurationMs = this.spawnJumpArcWave();
                break;
            case 2:
                waveDurationMs = this.spawnSlideTunnelWave();
                break;
            case 3:
                waveDurationMs = this.spawnDoubleJumpQrWave();
                break;
            case 4:
                waveDurationMs = this.spawnCoffeeRestWave();
                break;
            case 5:
                waveDurationMs = this.spawnFeverBonusWave();
                break;
        }

        // Set next wave trigger based on current speed
        this.nextWaveTimer = Math.max(1400, waveDurationMs * (480 / this.currentSpeed));
    }

    // Pattern 0: Flat sprint row of commits (Builds combo & rhythm)
    private spawnRunWave(): number {
        const { width } = this.scale;
        const count = 5;
        const spacing = 50;

        for (let i = 0; i < count; i++) {
            const j = this.jellies.create(width + (i * spacing), this.groundY - 32, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        }

        return 1600;
    }

    // Pattern 1: Parabolic jump arc over ground obstacle (Natural guide!)
    private spawnJumpArcWave(): number {
        const { width } = this.scale;
        const obstacleX = width + 240;

        // Ground obstacle right in the center
        const tex = Phaser.Math.Between(0, 1) === 0 ? 'obstacle_error' : 'obstacle_bug';
        const obs = this.obstacles.create(obstacleX, this.groundY - 26, tex) as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            if (tex === 'obstacle_error') {
                body.setSize(44, 48);
                body.setOffset(4, 8);
            } else {
                body.setSize(40, 36);
                body.setOffset(4, 6);
            }
        }

        // Parabolic arc matching jump physics: 7 items spanning 420px
        const arcOffsets = [
            { x: -180, y: -35 },
            { x: -120, y: -80 },
            { x: -60, y: -130 },
            { x: 0, y: -150 }, // Apex right above obstacle
            { x: 60, y: -130 },
            { x: 120, y: -80 },
            { x: 180, y: -35 }
        ];

        arcOffsets.forEach(pt => {
            const j = this.jellies.create(obstacleX + pt.x, this.groundY + pt.y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 2200;
    }

    // Pattern 2: Merge conflict barrier + low slide tunnel
    private spawnSlideTunnelWave(): number {
        const { width } = this.scale;
        const barrierX = width + 220;

        // Air barrier
        const obs = this.obstacles.create(barrierX, this.groundY - 72, 'obstacle_conflict') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(64, 26);
            body.setOffset(3, 4);
        }

        // Low row of commit grasses under the barrier
        for (let i = -120; i <= 120; i += 50) {
            const j = this.jellies.create(barrierX + i, this.groundY - 18, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        }

        return 2000;
    }

    // Pattern 3: High Double Jump with SSAFY QR Code Phone
    private spawnDoubleJumpQrWave(): number {
        const { width } = this.scale;
        const centerX = width + 260;

        // Ground obstacle below the QR peak
        const obs = this.obstacles.create(centerX, this.groundY - 26, 'obstacle_bug') as Phaser.Physics.Arcade.Sprite;
        obs.setDepth(15);
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
            body.setSize(40, 36);
            body.setOffset(4, 6);
        }

        // QR Code at high apex
        const qr = this.jellies.create(centerX, this.groundY - 170, 'jelly_qr') as Phaser.Physics.Arcade.Sprite;
        this.setupItemPhysics(qr, 300, 'qr');

        // Guide commits leading up and down
        const guides = [
            { x: -160, y: -40 },
            { x: -90, y: -105 },
            { x: 90, y: -105 },
            { x: 160, y: -40 }
        ];
        guides.forEach(g => {
            const j = this.jellies.create(centerX + g.x, this.groundY + g.y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 2200;
    }

    // Pattern 4: Coffee break & Health refill
    private spawnCoffeeRestWave(): number {
        const { width } = this.scale;
        const coffeeX = width + 200;

        // Floating Americano
        const coffee = this.items.create(coffeeX, this.groundY - 70, 'item_coffee') as Phaser.Physics.Arcade.Sprite;
        coffee.setDepth(16);
        const body = coffee.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
        }
        coffee.setData('type', 'coffee');

        // Floating bob
        this.tweens.add({
            targets: coffee,
            y: coffee.y - 12,
            duration: 450,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3 commits before and after
        [-100, -50, 50, 100].forEach(ox => {
            const j = this.jellies.create(coffeeX + ox, this.groundY - 32, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        });

        return 1800;
    }

    // Pattern 5: Fever Drink & Golden sprint
    private spawnFeverBonusWave(): number {
        const { width } = this.scale;
        const startX = width + 180;

        // Rare booster bottle
        const booster = this.items.create(startX, this.groundY - 70, 'item_fever') as Phaser.Physics.Arcade.Sprite;
        booster.setDepth(16);
        const body = booster.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
        }
        booster.setData('type', 'fever');

        // Trail of 6 commits right behind
        for (let i = 1; i <= 6; i++) {
            const j = this.jellies.create(startX + (i * 45), this.groundY - 32, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(j, 100, 'grass');
        }

        return 2000;
    }

    private setupItemPhysics(item: Phaser.Physics.Arcade.Sprite, points: number, type: string) {
        item.setDepth(16);
        const body = item.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-this.currentSpeed);
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

        // Top Left: HP Bar
        const barX = 30;
        const barY = 32;

        this.hpText = this.add.text(barX, barY - 18, '⚡ MENTAL HP: 100%', {
            fontFamily: 'Arial Black',
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

        // Top Center: Distance & Fever
        this.distanceText = this.add.text(width / 2, 24, '📍 0m 질주 중', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#38bdf8'
        }).setOrigin(0.5, 0).setDepth(50);

        this.feverText = this.add.text(width / 2, 54, '🔥 FEVER TIME! DOUBLE POINTS 🔥', {
            fontFamily: 'Arial Black',
            fontSize: '15px',
            color: '#facc15'
        }).setOrigin(0.5, 0).setDepth(50).setVisible(false);

        this.feverBar = this.add.graphics().setDepth(50).setVisible(false);

        // Top Right: Score & Best & Combo & Pause Button
        this.scoreText = this.add.text(width - 110, 20, '0', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(1, 0).setDepth(50);

        this.add.text(width - 110, 56, `BEST: ${this.highScore.toLocaleString()}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(1, 0).setDepth(50);

        this.comboText = this.add.text(width - 110, 80, '', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#f97316'
        }).setOrigin(1, 0).setDepth(50);

        // Pause Button (Top right circle)
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

        this.hpText.setText(`⚡ MENTAL HP: ${Math.round(this.currentHp)}%`);
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
        if (type === 'grass') {
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

        const totalEarned = points * multiplier;
        this.score += totalEarned;
        this.scoreText.setText(this.score.toLocaleString());

        if (this.combo >= 3) {
            this.comboText.setText(`🔥 ${this.combo} COMBO! (x${multiplier})`);
            this.comboText.setScale(1.2);
            this.tweens.add({ targets: this.comboText, scale: 1.0, duration: 150 });
        } else {
            this.comboText.setText('');
        }

        const floatColor = type === 'qr' ? '#38bdf8' : this.isFeverActive ? '#facc15' : '#4ade80';
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

        if (type === 'coffee') {
            this.coffeeCount++;
            this.currentHp = Math.min(this.maxHp, this.currentHp + 25);
            this.renderHpBar();
            this.audioManager.playCoffee();

            const floatText = this.add.text(item.x, item.y, '+25 HP 회복!', {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#38bdf8'
            }).setDepth(30);

            this.tweens.add({
                targets: floatText,
                y: floatText.y - 50,
                alpha: 0,
                duration: 600,
                onComplete: () => floatText.destroy()
            });
        } else if (type === 'fever') {
            this.startFeverMode();
            const floatText = this.add.text(item.x, item.y, '⚡ FEVER BOOST!!', {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#facc15'
            }).setDepth(30);

            this.tweens.add({
                targets: floatText,
                y: floatText.y - 50,
                alpha: 0,
                duration: 600,
                onComplete: () => floatText.destroy()
            });
        }

        item.destroy();
    }

    private handleHitObstacle(obs: Phaser.Physics.Arcade.Sprite) {
        if (this.isFeverActive) {
            this.score += 500;
            this.scoreText.setText(this.score.toLocaleString());

            const floatText = this.add.text(obs.x, obs.y, '+500 파괴!', {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#facc15'
            }).setDepth(30);
            this.tweens.add({ targets: floatText, y: floatText.y - 40, alpha: 0, duration: 500, onComplete: () => floatText.destroy() });

            this.cameras.main.shake(100, 0.015);
            obs.destroy();
            return;
        }

        const hitSuccess = this.player.hit();
        if (!hitSuccess) return;

        this.currentHp -= 20;
        this.combo = 0;
        this.comboText.setText('');
        this.cameras.main.shake(160, 0.025);

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
            fontFamily: 'Arial Black',
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);

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

        this.cameras.main.fade(400, 10, 14, 26);
        this.time.delayedCall(400, () => {
            this.scene.start('GameOver', {
                score: this.score,
                distance: Math.floor(this.distance),
                commits: this.commitCount,
                qrs: this.qrCount,
                coffees: this.coffeeCount
            });
        });
    }
}
