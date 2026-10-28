import { Scene } from 'phaser';
import { ScoreManager } from '../utils/ScoreManager';
import { AudioManager } from '../utils/AudioManager';
import { SkinManager } from '../utils/SkinManager';
import { StageManager } from '../utils/StageManager';

interface GameOverData {
    score: number;
    distance: number;
    commits: number;
    qrs: number;
    coffees: number;
    coins?: number;
    mode?: 'infinite' | 'stage';
    stageId?: number;
}

export class GameOver extends Scene {
    private score: number = 0;
    private distance: number = 0;
    private commits: number = 0;
    private qrs: number = 0;
    private coffees: number = 0;
    private coins: number = 0;
    private gameMode: 'infinite' | 'stage' = 'infinite';
    private stageId: number = 1;
    private isNewRecord: boolean = false;
    private audioManager: AudioManager;
    private popStateHandler?: () => void;

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
        this.coins = data.coins || 0;
        this.gameMode = data.mode || 'infinite';
        this.stageId = data.stageId || 1;

        this.isNewRecord = ScoreManager.saveHighScore(this.score);
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x070b14, 0x070b14, 0x1e1b4b, 0x2e1022, 1);
        bg.fillRect(0, 0, width, height);

        if (this.textures.exists('bg_s1_far')) {
            this.add.image(width / 2, height - 250, 'bg_s1_far').setAlpha(0.28);
        }

        // Top-Left Instant Back to Main Menu Button
        this.createButton(105, 42, '◀ 메인 화면 (ESC)', 0x1e293b, 0x2563eb, () => {
            this.goBackToMain();
        }, 160, 42, '14px').setDepth(500);

        // Header Title
        const headerTitle = this.add.text(width / 2, 55, 'GAME OVER', {
            fontFamily: '"Black Han Sans", sans-serif',
            fontSize: '54px',
            color: '#ef4444',
            stroke: '#0f172a',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: headerTitle,
            scale: 1.03,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Evaluation Subtitle
        const evalRank = this.gameMode === 'stage'
            ? `STAGE ${this.stageId} 도전 실패 · 목표까지 조금만 더 집중해보세요!`
            : this.getEvaluationRank(this.score);

        this.add.text(width / 2, 108, evalRank, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '19px',
            color: '#facc15'
        }).setOrigin(0.5);

        // Result Card Container
        const cardW = 740;
        const cardH = 365;
        const cx = (width - cardW) / 2;
        const cy = 138;

        const card = this.add.graphics();
        card.fillStyle(0x0f172a, 0.96);
        card.lineStyle(2.5, this.isNewRecord ? 0xfacc15 : 0x38bdf8, 0.9);
        card.fillRoundedRect(cx, cy, cardW, cardH, 16);
        card.strokeRoundedRect(cx, cy, cardW, cardH, 16);

        if (this.isNewRecord) {
            this.add.text(width / 2, cy + 24, 'NEW RECORD · 최고 기록 경신!', {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#facc15'
            }).setOrigin(0.5);
        }

        // Final Score
        this.add.text(width / 2, cy + 56, 'FINAL SCORE', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.text(width / 2, cy + 96, this.score.toLocaleString(), {
            fontFamily: 'Arial Black',
            fontSize: '46px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stats Grid
        const statY = cy + 162;
        this.createStatItem(cx + 80, statY, '달린 거리', `${this.distance}m`);
        this.createStatItem(cx + 215, statY, '커밋 잔디', `${this.commits}개`);
        this.createStatItem(cx + 350, statY, '출석 QR', `${this.qrs}개`);
        this.createStatItem(cx + 485, statY, '아메리카노', `${this.coffees}잔`);
        this.createStatItem(cx + 625, statY, '획득 코인', `+${this.coins}`, '#facc15');

        // Leaderboard Registration
        const savePrompt = this.add.text(width / 2, cy + 248, '전국 명예의 전당(실시간 랭킹)에 기록을 등록해보세요', {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '15px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        const regBtn = this.createButton(width / 2, cy + 288, '랭킹에 내 닉네임 등록', 0x0284c7, 0x0369a1, () => {
            this.promptRegisterLeaderboard(savePrompt, regBtn);
        }, 250, 40, '15px');

        const totalCoins = SkinManager.getCoins();
        this.add.text(width / 2, cy + 338, `보유 코인: ${totalCoins.toLocaleString()} G`, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#facc15'
        }).setOrigin(0.5);

        // Bottom Action Buttons
        const btnY = cy + cardH + 46;

        this.createButton(width / 2 - 210, btnY, '다시 도전 (SPACE)', 0x2563eb, 0x1d4ed8, () => {
            this.retryGame();
        }, 190, 48, '15px');

        if (this.gameMode === 'stage') {
            this.createButton(width / 2, btnY, '스테이지 선택', 0x059669, 0x047857, () => {
                this.scene.start('StageSelect');
            }, 180, 48, '15px');
        } else {
            this.createButton(width / 2, btnY, '점수 공유하기', 0x059669, 0x047857, () => {
                this.shareScore();
            }, 180, 48, '15px');
        }

        this.createButton(width / 2 + 205, btnY, '메인 화면으로 (ESC)', 0x334155, 0x475569, () => {
            this.goBackToMain();
        }, 190, 48, '15px');

        // Keyboard & Browser Back Support
        if (this.input.keyboard) {
            this.input.keyboard.once('keydown-SPACE', () => this.retryGame());
            this.input.keyboard.once('keydown-ESC', () => this.goBackToMain());
            this.input.keyboard.once('keydown-BACKSPACE', () => this.goBackToMain());
        }

        window.history.pushState({ scene: 'GameOver' }, '');
        this.popStateHandler = () => {
            if (this.scene.isActive('GameOver')) {
                this.scene.start('MainMenu');
            }
        };
        window.addEventListener('popstate', this.popStateHandler);

        this.events.once('shutdown', () => {
            if (this.popStateHandler) {
                window.removeEventListener('popstate', this.popStateHandler);
            }
        });
    }

    private retryGame() {
        this.audioManager.playJump();
        this.scene.start('Game', {
            mode: this.gameMode,
            stageId: this.stageId
        });
    }

    private goBackToMain() {
        this.audioManager.playClick();
        this.scene.start('MainMenu');
    }

    private async promptRegisterLeaderboard(promptText: Phaser.GameObjects.Text, regBtn: Phaser.GameObjects.Container) {
        const defaultName = `러너_${Math.floor(Math.random() * 900 + 100)}`;
        const name = window.prompt('명예의 전당에 등록할 닉네임을 입력하세요 (최대 10자):', defaultName);

        if (name && name.trim().length > 0) {
            const trimmed = name.trim().slice(0, 10);
            promptText.setText('실시간 랭킹 서버로 전송 중...');
            promptText.setColor('#38bdf8');
            regBtn.setVisible(false);

            const now = new Date();
            const dateStr = `${now.getMonth() + 1}.${now.getDate()}`;

            const highestStage = StageManager.getHighestUnlockedStage();
            await ScoreManager.submitScore({
                name: trimmed,
                score: this.score,
                distance: this.distance,
                date: dateStr,
                stage: highestStage
            });

            promptText.setText(`[${trimmed}] 님의 기록이 명예의 전당에 등록되었습니다!`);
            promptText.setColor('#4ade80');
            regBtn.destroy();
        }
    }

    private shareScore() {
        const text = `[SSAFY RUN: CYBER SPRINT]\n최종 점수 ${this.score.toLocaleString()}점 달성! (거리: ${this.distance}m)\nhttps://strongsun806.github.io/ssafy-run/`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('기록이 클립보드에 복사되었습니다!');
            }).catch(() => {
                prompt('아래 텍스트를 복사하여 공유하세요:', text);
            });
        } else {
            prompt('아래 텍스트를 복사하여 공유하세요:', text);
        }
    }

    private getEvaluationRank(score: number): string {
        if (score >= 12000) return 'SSS급 수석 스프린터 · 완벽한 컨트롤로 8시 40분 입실 성공';
        if (score >= 7000) return 'A급 1일 1커밋터 · 8시 55분 여유롭게 입실 성공';
        if (score >= 3500) return 'B급 아슬아슬 세이프 · 8시 59분 입실 체크 완료';
        return 'C급 지각 위기 · 장애물 패턴을 파악해 다시 도전해보세요';
    }

    private createStatItem(x: number, y: number, label: string, value: string, valColor: string = '#38bdf8') {
        this.add.text(x, y, label, {
            fontFamily: '"Do Hyeon", sans-serif',
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.text(x, y + 26, value, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: valColor
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
            bg.lineStyle(2, 0x38bdf8);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
        };
        draw(normalColor);

        const lbl = this.add.text(0, 0, text, {
            fontFamily: '"Black Han Sans", "Do Hyeon", sans-serif',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);

        const maxTextWidth = w - 18;
        if (lbl.width > maxTextWidth) {
            lbl.setScale(maxTextWidth / lbl.width);
        }

        const hitZone = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        container.add([bg, lbl, hitZone]);

        hitZone.on('pointerover', () => {
            draw(hoverColor);
            container.setScale(1.03);
        });

        hitZone.on('pointerout', () => {
            draw(normalColor);
            container.setScale(1.0);
        });

        hitZone.on('pointerdown', () => {
            this.audioManager.playJump();
            onClick();
        });

        return container;
    }
}
