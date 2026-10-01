import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;

        // 타이틀 텍스트
        this.add.text(width / 2, height / 2 - 50, 'SSAFY RUN', {
            fontFamily: 'Arial Black',
            fontSize: '56px',
            color: '#38bdf8',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // 안내 텍스트 (반짝이는 효과)
        const startText = this.add.text(width / 2, height / 2 + 50, '화면을 클릭하여 시작하세요!', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 화면 전체 어디든 클릭하면 Game 씬으로 전환
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}