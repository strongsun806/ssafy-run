import { SkinManager } from './SkinManager';

export interface UpgradeStatInfo {
    id: 'hp' | 'score' | 'drone';
    name: string;
    icon: string;
    level: number;
    maxLevel: number;
    cost: number;
    currentEffectText: string;
    nextEffectText: string;
    color: string;
}

export type BuildEdition = 'ultimate' | 'rpg' | 'arcade';

export class UpgradeManager {
    private static readonly STORAGE_KEY = 'ssafy_run_upgrades_v1';
    private static readonly DAILY_BONUS_KEY = 'ssafy_run_daily_supply_v1';
    private static readonly EDITION_KEY = 'ssafy_run_edition_v1';
    public static readonly MAX_LEVEL = 10;
    public static DEFAULT_EDITION: BuildEdition = 'ultimate';

    public static getEdition(): BuildEdition {
        try {
            const saved = localStorage.getItem(this.EDITION_KEY) as BuildEdition | null;
            if (saved === 'ultimate' || saved === 'rpg' || saved === 'arcade') {
                return saved;
            }
        } catch {
            // ignore
        }
        return this.DEFAULT_EDITION;
    }

    public static setEdition(edition: BuildEdition) {
        try {
            localStorage.setItem(this.EDITION_KEY, edition);
        } catch {
            // ignore
        }
    }

    public static isRpgTechEnabled(): boolean {
        const ed = this.getEdition();
        return ed === 'ultimate' || ed === 'rpg';
    }

    public static isArcadeDashEnabled(): boolean {
        const ed = this.getEdition();
        return ed === 'ultimate' || ed === 'arcade';
    }

    private static loadData(): { hp: number; score: number; drone: number } {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    hp: Math.min(this.MAX_LEVEL, Math.max(1, Number(parsed.hp) || 1)),
                    score: Math.min(this.MAX_LEVEL, Math.max(1, Number(parsed.score) || 1)),
                    drone: Math.min(this.MAX_LEVEL, Math.max(1, Number(parsed.drone) || 1))
                };
            }
        } catch {
            // ignore storage errors
        }
        return { hp: 1, score: 1, drone: 1 };
    }

    private static saveData(data: { hp: number; score: number; drone: number }) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch {
            // ignore storage errors
        }
    }

    public static getLevels() {
        return this.loadData();
    }

    public static getUpgradeCost(currentLevel: number): number {
        if (currentLevel >= this.MAX_LEVEL) return 0;
        return currentLevel * 250;
    }

    public static upgradeStat(id: 'hp' | 'score' | 'drone'): { success: boolean; message: string } {
        const data = this.loadData();
        const curLv = data[id];
        if (curLv >= this.MAX_LEVEL) {
            return { success: false, message: '이미 최대 레벨(MAX)에 도달했습니다!' };
        }
        const cost = this.getUpgradeCost(curLv);
        const coins = SkinManager.getCoins();
        if (coins < cost) {
            return { success: false, message: `코인이 부족합니다! (필요: 🪙 ${cost})` };
        }

        SkinManager.addCoins(-cost);
        data[id] = curLv + 1;
        this.saveData(data);
        return { success: true, message: `⚡ 강화 성공! Lv.${data[id]} 달성!` };
    }

    // Gameplay Computed Buffs
    public static getMaxHp(): number {
        const { hp } = this.loadData();
        return 100 + (hp - 1) * 10; // Lv.1 = 100, Lv.10 = 190
    }

    public static getScoreMultiplier(): number {
        const { score } = this.loadData();
        return 1 + (score - 1) * 0.08; // Lv.1 = 1.00x, Lv.10 = 1.72x
    }

    public static getDroneCooldownSec(): number {
        const { drone } = this.loadData();
        return Math.max(7, 16 - (drone - 1) * 1.0); // Lv.1 = 16s, Lv.10 = 7s
    }

    public static getAllUpgradeInfos(): UpgradeStatInfo[] {
        const data = this.loadData();
        return [
            {
                id: 'hp',
                name: '멘탈 코어 증폭 (MAX HP)',
                icon: '❤️',
                level: data.hp,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.hp),
                currentEffectText: `최대 멘탈 체력 ${100 + (data.hp - 1) * 10} HP`,
                nextEffectText: data.hp < this.MAX_LEVEL ? `다음 레벨: ${100 + data.hp * 10} HP (+10)` : '최고 단계 도달 (MAX)',
                color: '#4ade80'
            },
            {
                id: 'score',
                name: '알고리즘 연산 증폭 (SCORE%)',
                icon: '💎',
                level: data.score,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.score),
                currentEffectText: `모든 획득 점수 +${Math.round((data.score - 1) * 8)}% 추가 보너스`,
                nextEffectText: data.score < this.MAX_LEVEL ? `다음 레벨: +${Math.round(data.score * 8)}% (+8%)` : '최고 단계 도달 (MAX)',
                color: '#38bdf8'
            },
            {
                id: 'drone',
                name: 'AI 비트 드론 & 방어막 오버클럭',
                icon: '🤖',
                level: data.drone,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.drone),
                currentEffectText: `출격 시 쉴드 부여 · ${Math.max(7, 16 - (data.drone - 1))}초마다 장애물 요격/쉴드 충전`,
                nextEffectText: data.drone < this.MAX_LEVEL ? `다음 레벨: 쿨타임 ${Math.max(7, 16 - data.drone)}초로 단축 (-1초)` : '최고 단계 도달 (MAX)',
                color: '#c084fc'
            }
        ];
    }

    // Daily Free Supply Drop (+600 Coins once per day)
    public static canClaimDailySupply(): boolean {
        try {
            const today = new Date().toISOString().slice(0, 10);
            return localStorage.getItem(this.DAILY_BONUS_KEY) !== today;
        } catch {
            return false;
        }
    }

    public static claimDailySupply(): number {
        if (!this.canClaimDailySupply()) return 0;
        try {
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem(this.DAILY_BONUS_KEY, today);
        } catch {
            // ignore
        }
        const reward = 600;
        SkinManager.addCoins(reward);
        return reward;
    }
}
