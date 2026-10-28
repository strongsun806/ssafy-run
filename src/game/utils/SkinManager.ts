export interface SkinDef {
    id: string;
    name: string;
    description: string;
    price: number;
    color: string;
    hoodieColor: string;
    badgeColor: string;
    pantsColor: string;
    sneakerColor: string;
    scarfColor: string;
    glowColor: string;
}

export class SkinManager {
    private static readonly COINS_KEY = 'ssafy_run_coins';
    private static readonly OWNED_SKINS_KEY = 'ssafy_run_owned_skins';
    private static readonly EQUIPPED_SKIN_KEY = 'ssafy_run_equipped_skin';

    public static readonly SKINS: SkinDef[] = [
        {
            id: 'default',
            name: '네오 러너 (Neo Blue)',
            description: 'SSAFY 시그니처 블루 테크웨어와 네온 머플러를 장착한 기본 러너',
            price: 0,
            color: '#38bdf8',
            hoodieColor: '#2563eb',
            badgeColor: '#f97316',
            pantsColor: '#1e293b',
            sneakerColor: '#ef4444',
            scarfColor: '#38bdf8',
            glowColor: '#0284c7'
        },
        {
            id: 'red_hoodie',
            name: '크림슨 블레이즈 (Blaze)',
            description: '1일 1커밋의 불타는 투지와 플라즈마 화염 스카프를 두른 에디션',
            price: 600,
            color: '#ef4444',
            hoodieColor: '#dc2626',
            badgeColor: '#facc15',
            pantsColor: '#0f172a',
            sneakerColor: '#f97316',
            scarfColor: '#fb923c',
            glowColor: '#ef4444'
        },
        {
            id: 'cyber_agent',
            name: '고스트 넷러너 (Netrunner)',
            description: '버그를 단숨에 베어내는 딥블랙 & 시안 바이저 택티컬 요원',
            price: 1500,
            color: '#06b6d4',
            hoodieColor: '#0f172a',
            badgeColor: '#06b6d4',
            pantsColor: '#18181b',
            sneakerColor: '#22d3ee',
            scarfColor: '#06b6d4',
            glowColor: '#22d3ee'
        },
        {
            id: 'gold_master',
            name: '아크 마스터 (Arc Gold)',
            description: '최우수 수료생에게만 허락된 황금 헤일로(광배)와 로얄 망토',
            price: 3000,
            color: '#eab308',
            hoodieColor: '#ca8a04',
            badgeColor: '#fde047',
            pantsColor: '#451a03',
            sneakerColor: '#facc15',
            scarfColor: '#fef08a',
            glowColor: '#eab308'
        },
        {
            id: 'panda_pajama',
            name: '네온 판다 크루 (Panda)',
            description: '심야 해커톤의 귀여운 지배자! 네온 대나무 에너지 슈트',
            price: 4500,
            color: '#a855f7',
            hoodieColor: '#f8fafc',
            badgeColor: '#10b981',
            pantsColor: '#0f172a',
            sneakerColor: '#10b981',
            scarfColor: '#c084fc',
            glowColor: '#a855f7'
        }
    ];

    public static getCoins(): number {
        const val = localStorage.getItem(this.COINS_KEY);
        return val ? parseInt(val, 10) : 300; // 300 bonus coins on start!
    }

    public static addCoins(amount: number): number {
        const current = this.getCoins();
        const updated = current + amount;
        localStorage.setItem(this.COINS_KEY, updated.toString());
        return updated;
    }

    public static spendCoins(amount: number): boolean {
        const current = this.getCoins();
        if (current >= amount) {
            localStorage.setItem(this.COINS_KEY, (current - amount).toString());
            return true;
        }
        return false;
    }

    public static getOwnedSkins(): string[] {
        const val = localStorage.getItem(this.OWNED_SKINS_KEY);
        if (val) {
            try {
                const list = JSON.parse(val);
                if (Array.isArray(list)) return list;
            } catch {
                // fallback
            }
        }
        return ['default'];
    }

    public static isOwned(skinId: string): boolean {
        return this.getOwnedSkins().includes(skinId);
    }

    public static buySkin(skinId: string): boolean {
        const skin = this.SKINS.find(s => s.id === skinId);
        if (!skin || this.isOwned(skinId)) return false;

        if (this.spendCoins(skin.price)) {
            const owned = this.getOwnedSkins();
            owned.push(skinId);
            localStorage.setItem(this.OWNED_SKINS_KEY, JSON.stringify(owned));
            this.equipSkin(skinId);
            return true;
        }
        return false;
    }

    public static getEquippedSkin(): string {
        const val = localStorage.getItem(this.EQUIPPED_SKIN_KEY);
        if (val && this.isOwned(val)) {
            return val;
        }
        return 'default';
    }

    public static equipSkin(skinId: string): boolean {
        if (this.isOwned(skinId)) {
            localStorage.setItem(this.EQUIPPED_SKIN_KEY, skinId);
            return true;
        }
        return false;
    }

    public static getEquippedSkinDef(): SkinDef {
        const id = this.getEquippedSkin();
        return this.SKINS.find(s => s.id === id) || this.SKINS[0];
    }
}
