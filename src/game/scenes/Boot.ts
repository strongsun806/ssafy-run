import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
