import { Scene } from 'phaser';
import { ScoreManager } from '../utils/ScoreManager';
import { AudioManager } from '../utils/AudioManager';

interface GameOverData {
    score: number;
    distance: number;
    commits: number;
    qrs: number;
    coffees: number;
}

export class GameOver extends Scene {
    private score: number = 0;
    private distance: number = 0;
    private commits: number = 0;
    private qrs: number = 0;
    private coffees: number = 0;
    private isNewRecord: boolean = false;
    private audioManager: AudioManager;

    constructor() {
        super('GameOver');
        this.audioManager = AudioManager.getInstance();
    }

    init(data: GameOverData) {
        this.score = data.score || 0;
        this.distance = data.distance || 0;
        this.commits = data.commits || 0;
        this.qrs = data.qrs || 0;
        this.coffees = data.coffees || 0;

        this.isNewRecord = ScoreManager.saveHighScore(this.score);
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400, 10, 14, 26);

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x1e1b4b, 0x2e1022, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_skyline_far')) {
            this.add.image(width / 2, height - 250, 'bg_skyline_far').setAlpha(0.35);
        }

        // Header
        const headerTitle = this.add.text(width / 2, 65, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: '52px',
            color: '#ef4444',
            stroke: '#7f1d1d',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: headerTitle,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Evaluation Rank Title
        const evalRank = this.getEvaluationRank(this.score);
        this.add.text(width / 2, 120, evalRank, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#facc15'
        }).setOrigin(0.5);

        // Result Card
        const cardW = 680;
        const cardH = 350;
        const cx = (width - cardW) / 2;
        const cy = 150;

        const card = this.add.graphics();
        card.fillStyle(0x0f172a, 0.95);
        card.lineStyle(2, this.isNewRecord ? 0xfacc15 : 0x38bdf8);
        card.fillRoundedRect(cx, cy, cardW, cardH, 16);
        card.strokeRoundedRect(cx, cy, cardW, cardH, 16);

        if (this.isNewRecord) {
            const newRec = this.add.text(width / 2, cy + 24, '★ NEW RECORD! 최고 기록 달성! ★', {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: '#facc15'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: newRec,
                alpha: 0.4,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        this.add.text(width / 2, cy + 62, 'FINAL SCORE', {
            fontFamily: 'Arial Black',
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.text(width / 2, cy + 102, this.score.toLocaleString(), {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stats grid
        const statY = cy + 170;
        this.createStatItem(cx + 80, statY, '🏃 달린 거리', `${this.distance}m`);
        this.createStatItem(cx + 225, statY, '🌱 커밋 잔디', `${this.commits}개`);
        this.createStatItem(cx + 370, statY, '📱 출석 QR', `${this.qrs}개`);
        this.createStatItem(cx + 515, statY, '☕ 아메리카노', `${this.coffees}잔`);

        // Realtime Leaderboard registration
        const savePrompt = this.add.text(width / 2, cy + 260, '🌐 실시간 전국 교육생 랭킹에 내 기록을 등록하시겠습니까?', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        const regBtn = this.createButton(width / 2, cy + 300, '닉네임 등록 (REGISTER)', 0x0284c7, 0x0369a1, () => {
            this.promptRegisterLeaderboard(savePrompt, regBtn);
        }, 240, 38, '14px');

        // Action Buttons
        const btnY = cy + cardH + 45;

        this.createButton(width / 2 - 190, btnY, '🔄 다시 도전 (RETRY)', 0x2563eb, 0x1d4ed8, () => {
            this.scene.start('Game');
        }, 180, 50, '16px');

        this.createButton(width / 2, btnY, '🏠 메인 메뉴 (MENU)', 0x334155, 0x475569, () => {
            this.scene.start('MainMenu');
        }, 160, 50, '16px');

        this.createButton(width / 2 + 180, btnY, '📋 점수 공유 (SHARE)', 0x059669, 0x047857, () => {
            this.shareScore();
        }, 160, 50, '16px');

        if (this.input.keyboard) {
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('Game');
            });
        }
    }

    private async promptRegisterLeaderboard(promptText: Phaser.GameObjects.Text, regBtn: Phaser.GameObjects.Container) {
        const defaultName = `싸피인_${Math.floor(Math.random() * 900 + 100)}`;
        const name = window.prompt('실시간 랭킹에 등록할 닉네임을 입력하세요 (최대 10자):', defaultName);

        if (name && name.trim().length > 0) {
            const trimmed = name.trim().slice(0, 10);
            promptText.setText('📡 실시간 랭킹 서버로 전송 중...');
            promptText.setColor('#38bdf8');
            regBtn.setVisible(false);

            const now = new Date();
            const dateStr = `${now.getMonth() + 1}.${now.getDate()}`;

            const isOnline = await ScoreManager.submitScore({
                name: trimmed,
                score: this.score,
                distance: this.distance,
                date: dateStr
            });

            if (isOnline) {
                promptText.setText(`✅ [${trimmed}] 님의 점수가 실시간 온라인 랭킹에 등록되었습니다!`);
            } else {
                promptText.setText(`✅ [${trimmed}] 님의 기록이 명예의 전당에 등록되었습니다!`);
            }
            promptText.setColor('#4ade80');
            regBtn.destroy();
        }
    }

    private shareScore() {
        const text = `🏃‍♂️ [SSAFY RUN: OvenBreak]\n지각 위기에서 살아남아 ${this.score.toLocaleString()}점을 달성했습니다! (달린 거리: ${this.distance}m)\n너도 멀캠으로 출근해볼래? 🎮\nhttps://strongsun806.github.io/ssafy-run/`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요.');
            }).catch(() => {
                prompt('아래 텍스트를 복사하여 공유하세요:', text);
            });
        } else {
            prompt('아래 텍스트를 복사하여 공유하세요:', text);
        }
    }

    private getEvaluationRank(score: number): string {
        if (score >= 8000) return '👑 SSS급 SSAFY 수석 개발자 (빌드 완벽 & 8시 40분 여유 입실)';
        if (score >= 5000) return '🔥 열혈 1일 1커밋터 (9시 정각 세이프 & 에러 완파)';
        if (score >= 3000) return '☕ 아아 수혈 스프린터 (아슬아슬 8시 59분 입실 성공)';
        if (score >= 1500) return '🏃‍♂️ 비상계단 전력질주생 (엘리베이터 만원으로 계단 등반)';
        return '💀 멘탈 붕괴 지각생 (9시 01분 출석 불가... 내일은 일찍 오자!)';
    }

    private createStatItem(x: number, y: number, label: string, value: string) {
        this.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.text(x, y + 26, value, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#38bdf8'
        }).setOrigin(0.5);
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        normalColor: number,
        hoverColor: number,
        onClick: () => void,
        w: number,
        h: number,
        fontSize: string
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const draw = (color: number) => {
            bg.clear();
            bg.fillStyle(color, 0.95);
            bg.lineStyle(1.5, 0x38bdf8);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
        };
        draw(normalColor);

        const lbl = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, lbl]);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            draw(hoverColor);
            container.setScale(1.03);
        });

        container.on('pointerout', () => {
            draw(normalColor);
            container.setScale(1.0);
        });

        container.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }
}
