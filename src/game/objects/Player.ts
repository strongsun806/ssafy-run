import * as Phaser from 'phaser';
import { AudioManager } from '../utils/AudioManager';

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

    private groundY: number;
    private audioManager: AudioManager;

    // External touch control flags
    private touchJumpRequested: boolean = false;
    private touchSlidePressed: boolean = false;

    // Dust particles
    private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number, groundY: number) {
        super(scene, x, y, 'player_run_1');
        this.groundY = groundY;
        this.audioManager = AudioManager.getInstance();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setCollideWorldBounds(true);

        // Adjust body hitbox for trainee
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setSize(38, 68);
            body.setOffset(13, 10);
        }

        // Init keyboard keys
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        this.setupAnimations();
        this.setupParticles();

        this.play('player_anim_run');
    }

    private setupAnimations() {
        if (!this.scene.anims.exists('player_anim_run')) {
            this.scene.anims.create({
                key: 'player_anim_run',
                frames: [
                    { key: 'player_run_1' },
                    { key: 'player_run_2' },
                    { key: 'player_run_3' },
                    { key: 'player_run_4' }
                ],
                frameRate: 10,
                repeat: -1
            });
        }
    }

    private setupParticles() {
        if (this.scene.textures.exists('particle_dust')) {
            this.dustEmitter = this.scene.add.particles(0, 0, 'particle_dust', {
                speed: { min: 20, max: 60 },
                angle: { min: 140, max: 180 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 300,
                quantity: 1,
                frequency: 180,
                emitting: true
            });
            this.dustEmitter.startFollow(this, -16, 0);
        }
    }

    public resetJump() {
        if (this.jumpCount > 0) {
            this.jumpCount = 0;
            // Emit landing dust
            if (this.dustEmitter) {
                this.dustEmitter.explode(4, this.x - 10, this.y);
            }
        }
    }

    // Touch control triggers
    public requestTouchJump() {
        this.touchJumpRequested = true;
    }

    public setTouchSlide(isPressed: boolean) {
        this.touchSlidePressed = isPressed;
    }

    public setFever(fever: boolean) {
        this.isFever = fever;
        if (fever) {
            this.setTint(0xfde047); // Golden fever glow
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

    public update() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const isOnGround = body.blocked.down;

        // 1. Jump input check
        let isJumpJustPressed = this.touchJumpRequested;
        this.touchJumpRequested = false;

        if (this.cursors && !isJumpJustPressed) {
            const upJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);
            const spaceJustDown = this.keySpace ? Phaser.Input.Keyboard.JustDown(this.keySpace) : false;
            const wJustDown = this.keyW ? Phaser.Input.Keyboard.JustDown(this.keyW) : false;
            isJumpJustPressed = upJustDown || spaceJustDown || wJustDown;
        }

        if (isJumpJustPressed && this.jumpCount < this.maxJumps && !this.isSliding) {
            if (this.jumpCount === 0) {
                this.setVelocityY(-780);
                this.audioManager.playJump();
            } else {
                this.setVelocityY(-740);
                this.audioManager.playDoubleJump();
                // Double jump sparkle
                if (this.scene.textures.exists('particle_sparkle')) {
                    const spark = this.scene.add.particles(this.x, this.y - 20, 'particle_sparkle', {
                        speed: { min: 40, max: 120 },
                        lifespan: 350,
                        scale: { start: 1, end: 0 },
                        quantity: 6
                    });
                    this.scene.time.delayedCall(400, () => spark.destroy());
                }
            }
            this.jumpCount++;
            this.anims.stop();
            this.setTexture('player_jump');
        }

        // 2. Slide input check
        let isSlideHeld = this.touchSlidePressed;
        if (this.cursors && !isSlideHeld) {
            const downHeld = this.cursors.down.isDown;
            const sHeld = this.keyS ? this.keyS.isDown : false;
            isSlideHeld = downHeld || sHeld;
        }

        if (isSlideHeld && (isOnGround || this.isSliding)) {
            if (!this.isSliding) {
                this.isSliding = true;
                this.anims.stop();
                this.setTexture('player_slide');
                body.setSize(60, 32);
                body.setOffset(10, 16);
                this.audioManager.playSlide();
            }
        } else {
            if (this.isSliding) {
                this.isSliding = false;
                body.setSize(38, 68);
                body.setOffset(13, 10);
                if (this.y > this.groundY) {
                    this.setY(this.groundY);
                }
                this.setVelocityY(0);
            }
        }

        // 3. Ground / Air animation state
        if (isOnGround && !this.isSliding) {
            if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'player_anim_run') {
                this.play('player_anim_run');
            }
        } else if (!isOnGround && !this.isSliding) {
            if (this.texture.key !== 'player_jump') {
                this.anims.stop();
                this.setTexture('player_jump');
            }
        }

        // Manage dust emitter
        if (this.dustEmitter) {
            this.dustEmitter.emitting = isOnGround;
        }
    }

    // Invincibility flash effect
    public hit(): boolean {
        if (this.isInvincible || this.isFever) return false;

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
        if (this.dustEmitter) {
            this.dustEmitter.destroy();
        }
        super.destroy(fromScene);
    }
}
