import * as Phaser from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { SkinManager } from '../utils/SkinManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyW?: Phaser.Input.Keyboard.Key;
    private keyS?: Phaser.Input.Keyboard.Key;
    private keySpace?: Phaser.Input.Keyboard.Key;

    private jumpCount: number = 0;
    private maxJumps: number = 2;
    public isSliding: boolean = false;
    public isInvincible: boolean = false;
    public isFever: boolean = false;
    public isRescuing: boolean = false;

    // Temporary Magnet Power-Up State (자석 효과는 이제 일시적!)
    public magnetTimeRemaining: number = 0; // seconds

    private groundY: number;
    private audioManager: AudioManager;
    private skinId: string = 'default';

    // Advanced Input Buffering & Coyote Time
    private jumpBufferTime: number = 0;
    private coyoteTime: number = 0;
    private wasOnGround: boolean = false;

    // Touch control states
    private touchJumpTriggered: boolean = false;
    private touchSlideHeld: boolean = false;

    // Particle Emitters & Cyber Visuals
    private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private magnetRing?: Phaser.GameObjects.Graphics;
    private companionDrone?: Phaser.GameObjects.Image;
    private afterimageTimer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, groundY: number) {
        const equipped = SkinManager.getEquippedSkin();
        super(scene, x, y, `player_${equipped}_run_1`);
        this.groundY = groundY;
        this.skinId = equipped;
        this.audioManager = AudioManager.getInstance();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setCollideWorldBounds(false); // Allow falling into pits!

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setSize(38, 68);
            body.setOffset(13, 10);
        }

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        this.setupAnimations();
        this.setupParticles();

        // Magnet Aura Graphic
        this.magnetRing = scene.add.graphics().setDepth(18);

        // Autonomous Companion Bit-Drone
        if (scene.textures.exists('companion_drone')) {
            this.companionDrone = scene.add.image(x - 38, y - 58, 'companion_drone').setDepth(21);
        }

        this.play(`player_${this.skinId}_anim_run`);
    }

    private setupAnimations() {
        const animKey = `player_${this.skinId}_anim_run`;
        if (!this.scene.anims.exists(animKey)) {
            this.scene.anims.create({
                key: animKey,
                frames: [
                    { key: `player_${this.skinId}_run_1` },
                    { key: `player_${this.skinId}_run_2` },
                    { key: `player_${this.skinId}_run_3` },
                    { key: `player_${this.skinId}_run_4` }
                ],
                frameRate: 12,
                repeat: -1
            });
        }
    }

    private setupParticles() {
        if (this.scene.textures.exists('particle_dust')) {
            this.dustEmitter = this.scene.add.particles(0, 0, 'particle_dust', {
                speed: { min: 25, max: 70 },
                angle: { min: 140, max: 180 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 280,
                quantity: 1,
                frequency: 160,
                emitting: true
            });
            this.dustEmitter.startFollow(this, -16, 0);
        }
    }

    public resetJump() {
        this.jumpCount = 0;
        this.coyoteTime = 100;
        if (this.dustEmitter && !this.wasOnGround) {
            this.dustEmitter.explode(4, this.x - 10, this.y);
        }
    }

    public requestTouchJump() {
        this.jumpBufferTime = 160;
        this.touchJumpTriggered = true;
    }

    public setTouchSlide(isPressed: boolean) {
        this.touchSlideHeld = isPressed;
    }

    // Activate temporary magnet (e.g. 6.5s)
    public activateMagnet(duration: number = 6.5) {
        this.magnetTimeRemaining = Math.max(this.magnetTimeRemaining, duration);
        this.audioManager.playMagnet();
    }

    public setFever(fever: boolean) {
        this.isFever = fever;
        if (fever) {
            this.setTint(0xfde047);
            if (this.anims.currentAnim) {
                this.anims.timeScale = 1.6;
            }
        } else {
            this.clearTint();
            if (this.anims.currentAnim) {
                this.anims.timeScale = 1.0;
            }
        }
    }

    public update(_time?: number, delta: number = 16.6) {
        if (this.isRescuing) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Strict horizontal lock: Prevent collision push or velocity from ejecting player off-screen
        this.setX(180);
        this.setVelocityX(0);

        const deltaSec = delta / 1000;

        // Magnet timer decay
        if (this.magnetTimeRemaining > 0) {
            this.magnetTimeRemaining = Math.max(0, this.magnetTimeRemaining - deltaSec);
            this.renderMagnetAura();
        } else {
            this.magnetRing?.clear();
        }

        const isOnGround = body.blocked.down || body.touching.down;

        if (isOnGround) {
            this.coyoteTime = 100;
            this.jumpCount = 0;
        } else {
            this.coyoteTime = Math.max(0, this.coyoteTime - delta);
        }

        // 1. Jump input check
        let isJumpJustPressed = this.touchJumpTriggered;
        this.touchJumpTriggered = false;

        if (this.cursors) {
            const upJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);
            const spaceJustDown = this.keySpace ? Phaser.Input.Keyboard.JustDown(this.keySpace) : false;
            const wJustDown = this.keyW ? Phaser.Input.Keyboard.JustDown(this.keyW) : false;
            if (upJustDown || spaceJustDown || wJustDown) {
                isJumpJustPressed = true;
            }
        }

        if (isJumpJustPressed) {
            this.jumpBufferTime = 160;
        } else {
            this.jumpBufferTime = Math.max(0, this.jumpBufferTime - delta);
        }

        // 2. Execute Jump
        if (this.jumpBufferTime > 0 && !this.isSliding) {
            if (isOnGround || this.coyoteTime > 0) {
                this.setVelocityY(-860);
                this.jumpCount = 1;
                this.coyoteTime = 0;
                this.jumpBufferTime = 0;
                this.audioManager.playJump();
                this.anims.stop();
                this.setTexture(`player_${this.skinId}_jump`);
            } else if (this.jumpCount < this.maxJumps) {
                this.setVelocityY(-800);
                this.jumpCount = 2;
                this.jumpBufferTime = 0;
                this.audioManager.playDoubleJump();
                this.anims.stop();
                this.setTexture(`player_${this.skinId}_jump`);
                this.spawnJumpShockwave();

                if (this.scene.textures.exists('particle_sparkle')) {
                    const spark = this.scene.add.particles(this.x, this.y - 20, 'particle_sparkle', {
                        speed: { min: 50, max: 140 },
                        lifespan: 300,
                        scale: { start: 1, end: 0 },
                        quantity: 6
                    });
                    this.scene.time.delayedCall(350, () => spark.destroy());
                }
            }
        }

        // 3. Variable Jump Height
        let isJumpKeyHeld = this.touchJumpTriggered;
        if (this.cursors && !isJumpKeyHeld) {
            const upHeld = this.cursors.up.isDown;
            const spaceHeld = this.keySpace ? this.keySpace.isDown : false;
            const wHeld = this.keyW ? this.keyW.isDown : false;
            isJumpKeyHeld = upHeld || spaceHeld || wHeld;
        }
        if (!isJumpKeyHeld && body.velocity.y < -350) {
            this.setVelocityY(body.velocity.y * 0.75);
        }

        // 4. Slide & Fast Fall
        let isSlideHeld = this.touchSlideHeld;
        if (this.cursors && !isSlideHeld) {
            const downHeld = this.cursors.down.isDown;
            const sHeld = this.keyS ? this.keyS.isDown : false;
            isSlideHeld = downHeld || sHeld;
        }

        if (isSlideHeld && !isOnGround && body.velocity.y > -200) {
            this.setVelocityY(1050); // Instant dive drop!
        }

        if (isSlideHeld) {
            if (!this.isSliding) {
                this.isSliding = true;
                this.anims.stop();
                this.setTexture(`player_${this.skinId}_slide`);
                body.setSize(62, 30);
                body.setOffset(9, 18);
                this.audioManager.playSlide();
            }
        } else {
            if (this.isSliding) {
                this.isSliding = false;
                body.setSize(38, 68);
                body.setOffset(13, 10);
                if (this.y > this.groundY && !body.blocked.down) {
                    this.setY(this.groundY);
                }
                this.setVelocityY(0);
            }
        }

        // 5. Animations
        const runAnimKey = `player_${this.skinId}_anim_run`;
        if (isOnGround && !this.isSliding) {
            if (!this.anims.isPlaying || this.anims.currentAnim?.key !== runAnimKey) {
                this.play(runAnimKey);
            }
        } else if (!isOnGround && !this.isSliding) {
            const jumpTex = `player_${this.skinId}_jump`;
            if (this.texture.key !== jumpTex) {
                this.anims.stop();
                this.setTexture(jumpTex);
            }
        }

        if (this.dustEmitter) {
            this.dustEmitter.emitting = isOnGround;
        }

        // 6. Companion Bit-Drone Smooth Hover Follow
        if (this.companionDrone) {
            const hoverOffset = Math.sin(Date.now() / 220) * 6;
            const targetX = this.x - 42;
            const targetY = this.y - (this.isSliding ? 32 : 58) + hoverOffset;
            this.companionDrone.x = Phaser.Math.Linear(this.companionDrone.x, targetX, 0.25);
            this.companionDrone.y = Phaser.Math.Linear(this.companionDrone.y, targetY, 0.25);
            this.companionDrone.setRotation(Math.sin(Date.now() / 350) * 0.12);
        }

        // 7. Cyber Phantom Afterimage Trail (During Double Jump, Slide, or Fever)
        this.afterimageTimer += delta;
        if ((this.isFever || !isOnGround || this.isSliding) && this.afterimageTimer >= 55) {
            this.afterimageTimer = 0;
            this.spawnAfterimage();
        }

        this.wasOnGround = isOnGround;
    }

    private spawnAfterimage() {
        const ghost = this.scene.add.image(this.x, this.y, this.texture.key)
            .setOrigin(0.5, 1)
            .setDepth(this.depth - 1)
            .setAlpha(this.isFever ? 0.45 : 0.28)
            .setTint(this.isFever ? 0xfacc15 : 0x38bdf8);

        this.scene.tweens.add({
            targets: ghost,
            x: ghost.x - 42,
            alpha: 0,
            duration: 180,
            ease: 'Linear',
            onComplete: () => ghost.destroy()
        });
    }

    private spawnJumpShockwave() {
        const ring = this.scene.add.graphics().setDepth(this.depth - 1);
        ring.lineStyle(3, 0x38bdf8, 0.85);
        ring.strokeEllipse(0, 0, 32, 12);
        ring.setPosition(this.x, this.y - 6);

        this.scene.tweens.add({
            targets: ring,
            scaleX: 2.2,
            scaleY: 1.8,
            alpha: 0,
            duration: 260,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    private renderMagnetAura() {
        if (!this.magnetRing) return;
        this.magnetRing.clear();

        const pulse = 1 + Math.sin(Date.now() / 150) * 0.08;
        const radius = 65 * pulse;

        this.magnetRing.lineStyle(2, 0x38bdf8, 0.7);
        this.magnetRing.strokeCircle(this.x, this.y - 32, radius);

        this.magnetRing.lineStyle(1.5, 0x60a5fa, 0.4);
        this.magnetRing.strokeCircle(this.x, this.y - 32, radius + 15);
    }

    // Rescue from pit (SSAFY Emergency Rescue Drone)
    public rescueFromPit(onComplete: () => void) {
        if (this.isRescuing) return;
        this.isRescuing = true;
        this.isInvincible = true;
        this.audioManager.playRescue();

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocity(0, 0);
        }

        // 1. Drone spawns from high above
        const drone = this.scene.add.sprite(this.x, -60, 'rescue_drone')
            .setDepth(200)
            .setScale(1.15);

        // Dynamic tractor beam graphics
        const beam = this.scene.add.graphics().setDepth(199);

        // Status badge: "🚨 SSAFY RESCUE!"
        const rescueText = this.scene.add.text(this.x, -50, '🚨 SSAFY RESCUE!', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#facc15',
            stroke: '#0f172a',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(201);

        // Drone swoops down above the falling player
        this.scene.tweens.add({
            targets: drone,
            y: this.y - 85,
            duration: 320,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                rescueText.setPosition(drone.x, drone.y - 36);
                beam.clear();
                beam.fillStyle(0x38bdf8, 0.35);
                beam.beginPath();
                beam.moveTo(drone.x - 12, drone.y + 20);
                beam.lineTo(drone.x + 12, drone.y + 20);
                beam.lineTo(this.x + 30, this.y);
                beam.lineTo(this.x - 30, this.y);
                beam.closePath();
                beam.fill();
                beam.lineStyle(2, 0x38bdf8, 0.85);
                beam.stroke();
            },
            onComplete: () => {
                // Lift player up to safe ground level together with drone hovering above
                this.scene.tweens.add({
                    targets: this,
                    y: this.groundY,
                    duration: 550,
                    ease: 'Back.easeOut',
                    onUpdate: () => {
                        drone.y = this.y - 85;
                        rescueText.setPosition(drone.x, drone.y - 36);
                        beam.clear();
                        beam.fillStyle(0x38bdf8, 0.45);
                        beam.beginPath();
                        beam.moveTo(drone.x - 12, drone.y + 20);
                        beam.lineTo(drone.x + 12, drone.y + 20);
                        beam.lineTo(this.x + 30, this.y);
                        beam.lineTo(this.x - 30, this.y);
                        beam.closePath();
                        beam.fill();
                        beam.lineStyle(2, 0x06b6d4, 0.95);
                        beam.stroke();
                    },
                    onComplete: () => {
                        beam.destroy();
                        rescueText.destroy();

                        if (body) {
                            body.setAllowGravity(true);
                            this.setVelocityY(0);
                            this.setY(this.groundY);
                        }
                        this.isRescuing = false;

                        // Drone zooms swiftly away into the sky!
                        this.scene.tweens.add({
                            targets: drone,
                            x: this.x + 380,
                            y: -100,
                            duration: 480,
                            ease: 'Quad.easeIn',
                            onComplete: () => drone.destroy()
                        });

                        // 2.0s invincibility flash
                        this.scene.tweens.add({
                            targets: this,
                            alpha: 0.25,
                            yoyo: true,
                            repeat: 6,
                            duration: 150,
                            onComplete: () => {
                                this.setAlpha(1);
                                this.isInvincible = false;
                                onComplete();
                            }
                        });
                    }
                });
            }
        });
    }

    public hit(): boolean {
        if (this.isInvincible || this.isFever || this.isRescuing) return false;

        this.setX(180);
        this.setVelocityX(0);

        this.isInvincible = true;
        this.audioManager.playHit();

        this.scene.tweens.add({
            targets: this,
            alpha: 0.25,
            yoyo: true,
            repeat: 5,
            duration: 100,
            onComplete: () => {
                this.setAlpha(1);
                this.isInvincible = false;
            }
        });

        return true;
    }

    public destroy(fromScene?: boolean) {
        if (this.dustEmitter) this.dustEmitter.destroy();
        if (this.magnetRing) this.magnetRing.destroy();
        super.destroy(fromScene);
    }
}
