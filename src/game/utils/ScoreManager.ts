export interface LeaderboardEntry {
    name: string;
    score: number;
    distance: number;
    date: string;
}

export class ScoreManager {
    private static readonly HIGH_SCORE_KEY = 'ssafy_run_high_score';
    private static readonly LOCAL_LEADERBOARD_KEY = 'ssafy_run_local_leaderboard';

    /**
     * [실시간 멀티유저 온라인 랭킹 연동 완료]
     * 전국의 모든 컴퓨터, 스마트폰에서 실시간으로 랭킹이 공유됩니다.
     */
    public static FIREBASE_DB_URL: string = 'https://ssafy-run-default-rtdb.firebaseio.com/leaderboard';

    private static defaultLeaderboard: LeaderboardEntry[] = [
        { name: '멀캠1타강사', score: 9800, distance: 1680, date: '10.25' },
        { name: '1일1커밋장인', score: 7500, distance: 1320, date: '10.25' },
        { name: '아아수혈러버', score: 5600, distance: 1040, date: '10.26' },
        { name: '비상계단스프린터', score: 4200, distance: 820, date: '10.26' },
        { name: '8시59분세이프', score: 2800, distance: 560, date: '10.26' }
    ];

    public static getHighScore(): number {
        const val = localStorage.getItem(this.HIGH_SCORE_KEY);
        return val ? parseInt(val, 10) : 0;
    }

    public static saveHighScore(score: number): boolean {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
            return true;
        }
        return false;
    }

    // Fetch leaderboard: Firebase Realtime Database -> LocalStorage -> Default
    public static async fetchLeaderboard(): Promise<{ list: LeaderboardEntry[]; isOnline: boolean }> {
        if (this.FIREBASE_DB_URL && this.FIREBASE_DB_URL.trim().length > 0) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const url = `${this.FIREBASE_DB_URL.replace(/\/$/, '')}.json`;
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data && typeof data === 'object') {
                        const rawList: LeaderboardEntry[] = Object.values(data);
                        // Filter valid entries
                        const list = rawList.filter(e => e && typeof e.score === 'number' && typeof e.name === 'string');
                        
                        // If fewer than 5 entries, populate with defaults
                        if (list.length < 5) {
                            for (const def of this.defaultLeaderboard) {
                                if (!list.some(e => e.name === def.name)) {
                                    list.push(def);
                                }
                            }
                        }

                        list.sort((a, b) => b.score - a.score);
                        localStorage.setItem(this.LOCAL_LEADERBOARD_KEY, JSON.stringify(list));
                        return { list: list.slice(0, 10), isOnline: true };
                    }
                }
            } catch (e) {
                console.warn('Firebase sync failed, falling back to local cache', e);
            }
        }

        return { list: this.getLocalLeaderboard(), isOnline: false };
    }

    public static getLocalLeaderboard(): LeaderboardEntry[] {
        try {
            const cached = localStorage.getItem(this.LOCAL_LEADERBOARD_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.slice(0, 10);
                }
            }
        } catch {
            // Ignore parse errors
        }
        return [...this.defaultLeaderboard];
    }

    // Submit score: Push directly to Firebase & cache locally
    public static async submitScore(entry: LeaderboardEntry): Promise<boolean> {
        // 1. Local cache update
        const localList = this.getLocalLeaderboard();
        localList.push(entry);
        localList.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.LOCAL_LEADERBOARD_KEY, JSON.stringify(localList.slice(0, 10)));

        // 2. Real-time push to Firebase
        if (this.FIREBASE_DB_URL && this.FIREBASE_DB_URL.trim().length > 0) {
            try {
                const url = `${this.FIREBASE_DB_URL.replace(/\/$/, '')}.json`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                });
                return res.ok;
            } catch (e) {
                console.warn('Failed to submit to Firebase', e);
                return false;
            }
        }

        return false;
    }
}
