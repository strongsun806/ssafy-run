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

    // Advanced Input Buffering & Coyote Time
    private jumpBufferTime: number = 0; // ms
    private coyoteTime: number = 0; // ms
    private wasOnGround: boolean = false;

    // External touch control states
    private touchJumpTriggered: boolean = false;
    private touchSlideHeld: boolean = false;

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

    // Touch control hooks
    public requestTouchJump() {
        this.jumpBufferTime = 160; // 160ms jump buffer
        this.touchJumpTriggered = true;
    }

    public setTouchSlide(isPressed: boolean) {
        this.touchSlideHeld = isPressed;
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
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const isOnGround = body.blocked.down || body.touching.down;

        // Update Coyote Time & Ground State
        if (isOnGround) {
            this.coyoteTime = 100;
            this.jumpCount = 0;
        } else {
            this.coyoteTime = Math.max(0, this.coyoteTime - delta);
        }

        // 1. Check for Jump Press (Keyboard + Touch)
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
            this.jumpBufferTime = 160; // Buffer for 160ms
        } else {
            this.jumpBufferTime = Math.max(0, this.jumpBufferTime - delta);
        }

        // 2. Execute Jump if buffered
        if (this.jumpBufferTime > 0 && !this.isSliding) {
            // First jump (grounded or within coyote time)
            if (isOnGround || this.coyoteTime > 0) {
                this.setVelocityY(-860);
                this.jumpCount = 1;
                this.coyoteTime = 0;
                this.jumpBufferTime = 0;
                this.audioManager.playJump();
                this.anims.stop();
                this.setTexture('player_jump');
            }
            // Double jump (in air, jumpCount === 1)
            else if (this.jumpCount < this.maxJumps) {
                this.setVelocityY(-800);
                this.jumpCount = 2;
                this.jumpBufferTime = 0;
                this.audioManager.playDoubleJump();
                this.anims.stop();
                this.setTexture('player_jump');

                // Double jump sparkle
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

        // 3. Variable Jump Height: Short tap dampening
        let isJumpKeyHeld = this.touchJumpTriggered;
        if (this.cursors && !isJumpKeyHeld) {
            const upHeld = this.cursors.up.isDown;
            const spaceHeld = this.keySpace ? this.keySpace.isDown : false;
            const wHeld = this.keyW ? this.keyW.isDown : false;
            isJumpKeyHeld = upHeld || spaceHeld || wHeld;
        }
        if (!isJumpKeyHeld && body.velocity.y < -350) {
            this.setVelocityY(body.velocity.y * 0.75); // Cut upward velocity for snappy response
        }

        // 4. Slide & Fast Fall
        let isSlideHeld = this.touchSlideHeld;
        if (this.cursors && !isSlideHeld) {
            const downHeld = this.cursors.down.isDown;
            const sHeld = this.keyS ? this.keyS.isDown : false;
            isSlideHeld = downHeld || sHeld;
        }

        // If in air and slide is pressed -> FAST FALL (Dive drop!)
        if (isSlideHeld && !isOnGround && body.velocity.y > -200) {
            this.setVelocityY(1050); // Instantly drop to ground
        }

        // Slide activation on ground
        if (isSlideHeld) {
            if (!this.isSliding) {
                this.isSliding = true;
                this.anims.stop();
                this.setTexture('player_slide');
                body.setSize(62, 30);
                body.setOffset(9, 18);
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

        // 5. Visual State & Animation
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

        if (this.dustEmitter) {
            this.dustEmitter.emitting = isOnGround;
        }

        this.wasOnGround = isOnGround;
    }

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
