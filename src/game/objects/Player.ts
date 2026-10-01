import * as Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite
{
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpCount: number = 0;
    private maxJumps: number = 2;
    public isSliding: boolean = false;
    public isInvincible: boolean = false;
    private groundY: number;

    constructor(scene: Phaser.Scene, x: number, y: number, groundY: number)
    {
        super(scene, x, y, 'player_tex');
        this.groundY = groundY;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setCollideWorldBounds(true);

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        }
    }

    public resetJump()
    {
        this.jumpCount = 0;
    }

    public update()
    {
        if (!this.cursors || !this.body) return;

        // 1. 점프 조작
        const isJump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                       Phaser.Input.Keyboard.JustDown(this.cursors.space);

        if (isJump && this.jumpCount < this.maxJumps && !this.isSliding) {
            this.setVelocityY(-780);
            this.jumpCount++;
        }

        // 2. 슬라이드 조작 (바닥 꺼짐 방지)
        const isDownKey = this.cursors.down.isDown;
        const isOnGround = this.body.blocked.down;

        if (isDownKey && (isOnGround || this.isSliding)) {
            if (!this.isSliding) {
                this.isSliding = true;
                this.setScale(1.3, 0.45);
            }
        } else {
            if (this.isSliding) {
                this.isSliding = false;
                this.setScale(1, 1);
                if (this.y > this.groundY) {
                    this.setY(this.groundY);
                }
                this.setVelocityY(0);
            }
        }
    }

    // 피격 시 1초간 깜빡임 무적 연출
    public hit(): boolean
    {
        if (this.isInvincible) return false;

        this.isInvincible = true;
        this.scene.tweens.add({
            targets: this,
            alpha: 0.2,
            yoyo: true,
            repeat: 4,
            duration: 100,
            onComplete: () => {
                this.setAlpha(1);
                this.isInvincible = false;
            }
        });
        return true;
    }
}