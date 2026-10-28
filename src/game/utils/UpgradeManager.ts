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
    public static DEFAULT_EDITION: BuildEdition = 'rpg';

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
            return { success: false, message: '?대? 理쒕? ?덈꺼(MAX)???꾨떖?덉뒿?덈떎!' };
        }
        const cost = this.getUpgradeCost(curLv);
        const coins = SkinManager.getCoins();
        if (coins < cost) {
            return { success: false, message: `肄붿씤??遺議깊빀?덈떎! (?꾩슂: ?첌 ${cost})` };
        }

        SkinManager.addCoins(-cost);
        data[id] = curLv + 1;
        this.saveData(data);
        return { success: true, message: `??媛뺥솕 ?깃났! Lv.${data[id]} ?ъ꽦!` };
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
                name: '硫섑깉 肄붿뼱 利앺룺 (MAX HP)',
                icon: '?ㅿ툘',
                level: data.hp,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.hp),
                currentEffectText: `理쒕? 硫섑깉 泥대젰 ${100 + (data.hp - 1) * 10} HP`,
                nextEffectText: data.hp < this.MAX_LEVEL ? `?ㅼ쓬 ?덈꺼: ${100 + data.hp * 10} HP (+10)` : '理쒓퀬 ?④퀎 ?꾨떖 (MAX)',
                color: '#4ade80'
            },
            {
                id: 'score',
                name: '?뚭퀬由ъ쬁 ?곗궛 利앺룺 (SCORE%)',
                icon: '?뭿',
                level: data.score,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.score),
                currentEffectText: `紐⑤뱺 ?띾뱷 ?먯닔 +${Math.round((data.score - 1) * 8)}% 異붽? 蹂대꼫??,
                nextEffectText: data.score < this.MAX_LEVEL ? `?ㅼ쓬 ?덈꺼: +${Math.round(data.score * 8)}% (+8%)` : '理쒓퀬 ?④퀎 ?꾨떖 (MAX)',
                color: '#38bdf8'
            },
            {
                id: 'drone',
                name: 'AI 鍮꾪듃 ?쒕줎 & 諛⑹뼱留??ㅻ쾭?대윮',
                icon: '?쨼',
                level: data.drone,
                maxLevel: this.MAX_LEVEL,
                cost: this.getUpgradeCost(data.drone),
                currentEffectText: `異쒓꺽 ???대뱶 遺??쨌 ${Math.max(7, 16 - (data.drone - 1))}珥덈쭏???μ븷臾??붽꺽/?대뱶 異⑹쟾`,
                nextEffectText: data.drone < this.MAX_LEVEL ? `?ㅼ쓬 ?덈꺼: 荑⑦???${Math.max(7, 16 - data.drone)}珥덈줈 ?⑥텞 (-1珥?` : '理쒓퀬 ?④퀎 ?꾨떖 (MAX)',
                color: '#c084fc'
            }
        ];
    }

    // Daily Free Supply Drop (+500 Coins once per day)
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

