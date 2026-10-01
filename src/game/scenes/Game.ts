import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Player } from '../objects/Player';

export class Game extends Scene
{
    private player!: Player;
    private ground!: Phaser.Physics.Arcade.StaticGroup;
    private obstacles!: Phaser.Physics.Arcade.Group;
    private jellies!: Phaser.Physics.Arcade.Group;
    private items!: Phaser.Physics.Arcade.Group;

    private groundY: number = 0;
    
    // 멘탈 게이지 (HP)
    private maxHp: number = 100;
    private currentHp: number = 100;
    private hpBarFill!: Phaser.GameObjects.Graphics;
    private hpDrainRate: number = 2.5;

    // 점수판
    public score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;

    // 타이머
    private spawnTimer!: Phaser.Time.TimerEvent;
    private jellyTimer!: Phaser.Time.TimerEvent;
    private coffeeTimer!: Phaser.Time.TimerEvent;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const { width, height } = this.scale;
        this.createDummyTextures();

        // 1. 바닥 생성
        this.groundY = height - 50;
        this.ground = this.physics.add.staticGroup();
        for (let x = 0; x < width + 64; x += 64) {
            this.ground.create(x, this.groundY + 30, 'ground_tex');
        }

        // 2. 분리한 Player 객체 생성 및 바닥 충돌 연결
        this.player = new Player(this, 200, this.groundY, this.groundY);
        this.physics.add.collider(this.player, this.ground, () => {
            if (this.player.body && this.player.body.blocked.down) {
                this.player.resetJump();
            }
        });

        // 3. 그룹 생성 & 충돌 이벤트 등록
        this.obstacles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.obstacles, () => this.handleHitObstacle());

        this.jellies = this.physics.add.group();
        this.physics.add.overlap(this.player, this.jellies, (_p, j) => {
            this.collectJelly(j as Phaser.Physics.Arcade.Sprite);
        });

        this.items = this.physics.add.group();
        this.physics.add.overlap(this.player, this.items, (_p, i) => {
            this.collectCoffee(i as Phaser.Physics.Arcade.Sprite);
        });

        // 4. UI 생성
        this.score = 0;
        this.currentHp = 100;
        this.scoreText = this.add.text(30, 25, 'SCORE: 0', {
            fontFamily: 'Arial Black', fontSize: '28px', color: '#38bdf8', strokeThickness: 6
        });
        this.createHpBarUI();

        // 5. 스폰 타이머 등록
        this.spawnTimer = this.time.addEvent({ delay: 1600, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.jellyTimer = this.time.addEvent({ delay: 800, callback: this.spawnJellyPattern, callbackScope: this, loop: true });
        this.coffeeTimer = this.time.addEvent({ delay: 6000, callback: this.spawnCoffee, callbackScope: this, loop: true });
    }

    update (_time: number, delta: number)
    {
        // 멘탈 자연 감소
        this.currentHp -= (this.hpDrainRate * (delta / 1000));
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.triggerGameOver();
            return;
        }
        this.renderHpBar();

        // 분리된 플레이어 업데이트 실행
        this.player.update();

        // 화면 밖 오브젝트 제거
        this.cleanOffscreen(this.obstacles);
        this.cleanOffscreen(this.jellies);
        this.cleanOffscreen(this.items);
    }

    private cleanOffscreen(group: Phaser.Physics.Arcade.Group)
    {
        group.getChildren().forEach((child) => {
            const sprite = child as Phaser.Physics.Arcade.Sprite;
            if (sprite.x < -60) sprite.destroy();
        });
    }

    private createHpBarUI ()
    {
        const barX = 30;
        const barY = 70;
        this.add.text(barX, barY - 22, 'MENTAL HP', { fontFamily: 'Arial Black', fontSize: '14px', color: '#cbd5e1' });

        const hpBarBg = this.add.graphics();
        hpBarBg.fillStyle(0x0f172a, 0.8);
        hpBarBg.lineStyle(2, 0x475569);
        hpBarBg.fillRoundedRect(barX, barY, 300, 22, 6);
        hpBarBg.strokeRoundedRect(barX, barY, 300, 22, 6);

        this.hpBarFill = this.add.graphics();
        this.renderHpBar();
    }

    private renderHpBar ()
    {
        const hpRatio = Phaser.Math.Clamp(this.currentHp / this.maxHp, 0, 1);
        this.hpBarFill.clear();

        let barColor = 0x22c55e;
        if (hpRatio < 0.3) barColor = 0xef4444;
        else if (hpRatio < 0.6) barColor = 0xf59e0b;

        this.hpBarFill.fillStyle(barColor, 1);
        if (hpRatio > 0) {
            this.hpBarFill.fillRoundedRect(32, 72, 296 * hpRatio, 18, 4);
        }
    }

    private collectCoffee (item: Phaser.Physics.Arcade.Sprite)
    {
        this.currentHp = Math.min(this.maxHp, this.currentHp + 25);
        this.renderHpBar();

        const floatText = this.add.text(item.x, item.y, '+25 HP', { fontFamily: 'Arial Black', fontSize: '20px', color: '#38bdf8' });
        this.tweens.add({ targets: floatText, y: floatText.y - 45, alpha: 0, duration: 600, onComplete: () => floatText.destroy() });
        this.tweens.add({ targets: item, scale: 1.4, alpha: 0, duration: 150, onComplete: () => item.destroy() });
    }

    private handleHitObstacle ()
    {
        const hitSuccess = this.player.hit();
        if (!hitSuccess) return;

        this.currentHp -= 20;
        this.cameras.main.shake(150, 0.02);

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.renderHpBar();
            this.triggerGameOver();
        }
    }

    private triggerGameOver ()
    {
        this.physics.pause();
        if (this.spawnTimer) this.spawnTimer.remove();
        if (this.jellyTimer) this.jellyTimer.remove();
        if (this.coffeeTimer) this.coffeeTimer.remove();

        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('GameOver', { score: this.score });
        });
    }

    private spawnObstacle ()
    {
        const { width } = this.scale;
        const isAir = Phaser.Math.Between(0, 1) === 1;
        const yPos = isAir ? this.groundY - 70 : this.groundY - 20;
        const tex = isAir ? 'obstacle_air' : 'obstacle_ground';

        const obs = this.obstacles.create(width + 60, yPos, tex) as Phaser.Physics.Arcade.Sprite;
        const body = obs.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-450);
        }
    }

    private spawnJellyPattern ()
    {
        const { width } = this.scale;
        const pattern = Phaser.Math.Between(0, 2);

        if (pattern === 0) {
            for (let i = 0; i < 3; i++) {
                const j = this.jellies.create(width + (i * 45), this.groundY - 35, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
                this.setupItemPhysics(j, 100);
            }
        } else if (pattern === 1) {
            const heights = [this.groundY - 50, this.groundY - 110, this.groundY - 140, this.groundY - 110, this.groundY - 50];
            heights.forEach((y, idx) => {
                const j = this.jellies.create(width + (idx * 40), y, 'jelly_grass') as Phaser.Physics.Arcade.Sprite;
                this.setupItemPhysics(j, 100);
            });
        } else {
            const qr = this.jellies.create(width + 40, this.groundY - 120, 'jelly_qr') as Phaser.Physics.Arcade.Sprite;
            this.setupItemPhysics(qr, 300);
        }
    }

    private spawnCoffee ()
    {
        const { width } = this.scale;
        const coffee = this.items.create(width + 40, this.groundY - 90, 'item_coffee') as Phaser.Physics.Arcade.Sprite;
        this.setupItemPhysics(coffee, 0);
    }

    private setupItemPhysics (item: Phaser.Physics.Arcade.Sprite, points: number)
    {
        const body = item.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
            body.setVelocityX(-450);
        }
        item.setData('points', points);
    }

    private collectJelly (jelly: Phaser.Physics.Arcade.Sprite)
    {
        const points = jelly.getData('points') || 100;
        this.score += points;
        this.scoreText.setText(`SCORE: ${this.score}`);

        const floatText = this.add.text(jelly.x, jelly.y, `+${points}`, {
            fontFamily: 'Arial', fontSize: '18px', color: points >= 300 ? '#facc15' : '#4ade80'
        });
        this.tweens.add({ targets: floatText, y: floatText.y - 40, alpha: 0, duration: 500, onComplete: () => floatText.destroy() });
        this.tweens.add({ targets: jelly, scale: 0.1, y: jelly.y - 20, duration: 150, onComplete: () => jelly.destroy() });
    }

    private createDummyTextures ()
    {
        if (!this.textures.exists('player_tex')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x38bdf8);
            g.fillRoundedRect(0, 0, 50, 70, 10);
            g.generateTexture('player_tex', 50, 70);
            g.destroy();
        }

        if (!this.textures.exists('ground_tex')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x1e293b);
            g.fillRect(0, 0, 64, 60);
            g.lineStyle(2, 0x38bdf8);
            g.lineBetween(0, 0, 64, 0);
            g.generateTexture('ground_tex', 64, 60);
            g.destroy();
        }

        if (!this.textures.exists('obstacle_ground')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xef4444);
            g.fillRoundedRect(0, 0, 45, 55, 6);
            g.generateTexture('obstacle_ground', 45, 55);
            g.destroy();
        }

        if (!this.textures.exists('obstacle_air')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xf59e0b);
            g.fillRoundedRect(0, 0, 60, 30, 6);
            g.generateTexture('obstacle_air', 60, 30);
            g.destroy();
        }

        if (!this.textures.exists('jelly_grass')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x22c55e);
            g.fillCircle(12, 12, 12);
            g.fillStyle(0x86efac);
            g.fillCircle(10, 8, 4);
            g.generateTexture('jelly_grass', 24, 24);
            g.destroy();
        }

        if (!this.textures.exists('jelly_qr')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xffffff);
            g.fillRoundedRect(0, 0, 30, 30, 4);
            g.fillStyle(0x0f172a);
            g.fillRect(6, 6, 7, 7);
            g.fillRect(17, 6, 7, 7);
            g.fillRect(6, 17, 7, 7);
            g.fillRect(17, 17, 7, 7);
            g.generateTexture('jelly_qr', 30, 30);
            g.destroy();
        }

        if (!this.textures.exists('item_coffee')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x78350f);
            g.fillRoundedRect(4, 8, 22, 26, 3);
            g.fillStyle(0x94a3b8, 0.6);
            g.fillRect(2, 6, 26, 4);
            g.fillStyle(0xef4444);
            g.fillRect(18, 0, 3, 10);
            g.generateTexture('item_coffee', 30, 36);
            g.destroy();
        }
    }
}