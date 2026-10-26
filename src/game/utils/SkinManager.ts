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
}

export class SkinManager {
    private static readonly COINS_KEY = 'ssafy_run_coins';
    private static readonly OWNED_SKINS_KEY = 'ssafy_run_owned_skins';
    private static readonly EQUIPPED_SKIN_KEY = 'ssafy_run_equipped_skin';

    public static readonly SKINS: SkinDef[] = [
        {
            id: 'default',
            name: '기본 싸피생 (Blue)',
            description: 'SSAFY 공식 블루 후드와 사원증을 착용한 모범 교육생',
            price: 0,
            color: '#38bdf8',
            hoodieColor: '#2563eb',
            badgeColor: '#f97316',
            pantsColor: '#1e293b',
            sneakerColor: '#ef4444'
        },
        {
            id: 'red_hoodie',
            name: '열정의 불꽃 (Red)',
            description: '1일 1커밋의 불타는 열정을 담은 강렬한 레드 에디션',
            price: 600,
            color: '#ef4444',
            hoodieColor: '#dc2626',
            badgeColor: '#facc15',
            pantsColor: '#0f172a',
            sneakerColor: '#f97316'
        },
        {
            id: 'cyber_agent',
            name: '네온 사이버 요원 (Cyber)',
            description: '버그를 암살하는 딥블랙 & 네온 시안 사이버 수트',
            price: 1500,
            color: '#06b6d4',
            hoodieColor: '#0f172a',
            badgeColor: '#06b6d4',
            pantsColor: '#18181b',
            sneakerColor: '#06b6d4'
        },
        {
            id: 'gold_master',
            name: '골든 마스터 (Gold)',
            description: '수석 수료생에게만 허락된 눈부신 순금 왕관 에디션',
            price: 3000,
            color: '#eab308',
            hoodieColor: '#ca8a04',
            badgeColor: '#fde047',
            pantsColor: '#78350f',
            sneakerColor: '#facc15'
        },
        {
            id: 'panda_pajama',
            name: '판다 잠옷생 (Panda)',
            description: '새벽 코딩으로 지쳐 귀여운 동물 잠옷을 입고 뛰는 교육생',
            price: 4500,
            color: '#a855f7',
            hoodieColor: '#e2e8f0',
            badgeColor: '#10b981',
            pantsColor: '#0f172a',
            sneakerColor: '#10b981'
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
