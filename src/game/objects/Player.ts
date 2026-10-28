import * as Phaser from 'phaser';
import { AudioManager } from '../utils/AudioManager';
import { SkinManager } from '../utils/SkinManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyW?: Phaser.Input.Keyboard.Key;
    private keyS?: Phaser.Input.Keyboard.Key;
    private keySpace?: Phaser.Input.Keyboard.Key;
    private keyShift?: Phaser.Input.Keyboard.Key;
    private keyE?: Phaser.Input.Keyboard.Key;

    private jumpCount: number = 0;
    private maxJumps: number = 2;
    public isSliding: boolean = false;
    public isInvincible: boolean = false;
    public isFever: boolean = false;
    public isRescuing: boolean = false;

    // Plasma Shield & Hyper Dash States
    public hasShield: boolean = false;
    public isDashing: boolean = false;
    public dashTimeRemaining: number = 0;
    public dashCooldownRemaining: number = 0;

    // Temporary Magnet Power-Up State
    public magnetTimeRemaining: number = 0;

    private groundY: number;
    private audioManager: AudioManager;
    private skinId: string = 'default';

    // Advanced Input Buffering & Coyote Time
    private jumpBufferTime: number = 0;
    private coyoteTime: number = 0;

    // Touch control states
    private touchJumpTriggered: boolean = false;
    private touchSlideHeld: boolean = false;

    // Calm Visual Indicators
    private magnetRing?: Phaser.GameObjects.Graphics;
    private shieldRing?: Phaser.GameObjects.Graphics;
    private companionDrone?: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, groundY: number) {
        const equipped = SkinManager.getEquippedSkin();
        super(scene, x, y, `player_${equipped}_run_1`);
        this.groundY = groundY;
        this.skinId = equipped;
        this.audioManager = AudioManager.getInstance();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setCollideWorldBounds(false);

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
            this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
            this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        }

        this.setupAnimations();

        // Calm, non-pulsing aura graphics
        this.magnetRing = scene.add.graphics().setDepth(18);
        this.shieldRing = scene.add.graphics().setDepth(22);

        // Steady Companion Drone
        if (scene.textures.exists('companion_drone')) {
            this.companionDrone = scene.add.image(x - 38, y - 56, 'companion_drone')
                .setDepth(21)
                .setAlpha(0.75);
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
                frameRate: 10,
                repeat: -1
            });
        }
    }

    public resetJump() {
        this.jumpCount = 0;
        this.coyoteTime = 100;
    }

    public requestTouchJump() {
        this.jumpBufferTime = 160;
        this.touchJumpTriggered = true;
    }

    public setTouchSlide(isPressed: boolean) {
        this.touchSlideHeld = isPressed;
    }

    public activateMagnet(duration: number = 6.5) {
        this.magnetTimeRemaining = Math.max(this.magnetTimeRemaining, duration);
        this.audioManager.playMagnet();
    }

    public activateShield() {
        this.hasShield = true;
    }

    public breakShield() {
        this.hasShield = false;
        this.shieldRing?.clear();
        this.isInvincible = true;
        this.setAlpha(0.65);
        this.scene.time.delayedCall(1000, () => {
            this.setAlpha(1);
            this.isInvincible = false;
        });
    }

    public triggerHyperDash(allowDash: boolean = true): boolean {
        if (!allowDash || this.isDashing || this.dashCooldownRemaining > 0 || this.isRescuing) {
            return false;
        }
        this.isDashing = true;
        this.dashTimeRemaining = 1.25;
        this.dashCooldownRemaining = 7.5;
        this.audioManager.playDoubleJump();
        return true;
    }

    public getDronePosition(): { x: number; y: number } {
        if (this.companionDrone) {
            return { x: this.companionDrone.x, y: this.companionDrone.y };
        }
        return { x: this.x - 38, y: this.y - 55 };
    }

    public setFever(fever: boolean) {
        this.isFever = fever;
        if (this.anims.currentAnim) {
            this.anims.timeScale = fever ? 1.15 : 1.0;
        }
    }

    public update(_time?: number, delta: number = 16.6) {
        if (this.isRescuing) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Strict horizontal lock
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

        // Hyper Dash & Cooldown timers
        if (this.dashCooldownRemaining > 0) {
            this.dashCooldownRemaining = Math.max(0, this.dashCooldownRemaining - deltaSec);
        }
        if (this.isDashing) {
            this.dashTimeRemaining = Math.max(0, this.dashTimeRemaining - deltaSec);
            if (this.dashTimeRemaining <= 0) {
                this.isDashing = false;
            }
        }

        // Keyboard Dash Trigger (Shift or E)
        if ((this.keyShift && Phaser.Input.Keyboard.JustDown(this.keyShift)) ||
            (this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE))) {
            this.scene.events.emit('request-hyper-dash');
        }

        // Render calm Shield & Dash outline
        this.renderShieldAndDashAura();

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
            this.setVelocityY(1050);
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

        // 6. Companion Drone Steady Follow (No wobble, no bobbing)
        if (this.companionDrone) {
            const targetX = this.x - 40;
            const targetY = this.y - (this.isSliding ? 32 : 56);
            this.companionDrone.x = Phaser.Math.Linear(this.companionDrone.x, targetX, 0.25);
            this.companionDrone.y = Phaser.Math.Linear(this.companionDrone.y, targetY, 0.25);
        }
    }

    private renderShieldAndDashAura() {
        if (!this.shieldRing) return;
        this.shieldRing.clear();

        const cx = this.x;
        const cy = this.y - (this.isSliding ? 18 : 34);

        // Static, soft translucent circle (No spinning hexagon, no pulsing)
        if (this.hasShield) {
            this.shieldRing.lineStyle(2, 0x38bdf8, 0.4);
            this.shieldRing.fillStyle(0x38bdf8, 0.06);
            this.shieldRing.fillCircle(cx, cy, 38);
            this.shieldRing.strokeCircle(cx, cy, 38);
        }

        if (this.isDashing) {
            this.shieldRing.lineStyle(2.5, 0x38bdf8, 0.65);
            this.shieldRing.beginPath();
            this.shieldRing.moveTo(cx + 8, cy - 28);
            this.shieldRing.lineTo(cx + 38, cy);
            this.shieldRing.lineTo(cx + 8, cy + 28);
            this.shieldRing.strokePath();
        }
    }

    private renderMagnetAura() {
        if (!this.magnetRing) return;
        this.magnetRing.clear();

        this.magnetRing.lineStyle(1.5, 0x38bdf8, 0.35);
        this.magnetRing.strokeCircle(this.x, this.y - 32, 56);
    }

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

        const drone = this.scene.add.sprite(this.x, -60, 'rescue_drone')
            .setDepth(200);

        this.scene.tweens.add({
            targets: drone,
            y: this.y - 75,
            duration: 280,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    y: this.groundY,
                    duration: 450,
                    ease: 'Quad.easeOut',
                    onUpdate: () => {
                        drone.y = this.y - 75;
                    },
                    onComplete: () => {
                        if (body) {
                            body.setAllowGravity(true);
                            this.setVelocityY(0);
                            this.setY(this.groundY);
                        }
                        this.isRescuing = false;

                        this.scene.tweens.add({
                            targets: drone,
                            x: this.x + 280,
                            y: -90,
                            duration: 400,
                            ease: 'Quad.easeIn',
                            onComplete: () => drone.destroy()
                        });

                        // Calm dim during brief invincibility (no rapid strobing)
                        this.setAlpha(0.6);
                        this.scene.time.delayedCall(1200, () => {
                            this.setAlpha(1);
                            this.isInvincible = false;
                            onComplete();
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

        // Calm dim instead of rapid alpha strobe
        this.setAlpha(0.55);
        this.scene.time.delayedCall(900, () => {
            this.setAlpha(1);
            this.isInvincible = false;
        });

        return true;
    }

    public destroy(fromScene?: boolean) {
        if (this.magnetRing) this.magnetRing.destroy();
        if (this.shieldRing) this.shieldRing.destroy();
        super.destroy(fromScene);
    }
}
