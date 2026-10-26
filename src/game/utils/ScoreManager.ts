export interface LeaderboardEntry {
    name: string;
    score: number;
    distance: number;
    date: string;
}

export class ScoreManager {
    private static readonly HIGH_SCORE_KEY = 'ssafy_run_high_score';
    private static readonly LEADERBOARD_KEY = 'ssafy_run_leaderboard';

    public static getHighScore(): number {
        const val = localStorage.getItem(this.HIGH_SCORE_KEY);
        return val ? parseInt(val, 10) : 0;
    }

    public static saveScore(score: number): boolean {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
            return true; // New record
        }
        return false;
    }

    public static getLeaderboard(): LeaderboardEntry[] {
        try {
            const data = localStorage.getItem(this.LEADERBOARD_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to parse leaderboard', e);
        }
        // Default seed data with SSAFY references
        return [
            { name: '멀캠1타강사', score: 8500, distance: 1520, date: '2026.10.20' },
            { name: '1일1커밋장인', score: 6200, distance: 1140, date: '2026.10.22' },
            { name: '비상계단스프린터', score: 4800, distance: 920, date: '2026.10.24' },
            { name: '아아수혈러버', score: 3500, distance: 680, date: '2026.10.25' },
            { name: '8시59분세이프', score: 2100, distance: 450, date: '2026.10.26' },
        ];
    }

    public static addLeaderboardEntry(entry: LeaderboardEntry): boolean {
        const list = this.getLeaderboard();
        list.push(entry);
        list.sort((a, b) => b.score - a.score);
        const top5 = list.slice(0, 5);
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(top5));
        return top5.some(item => item.name === entry.name && item.score === entry.score);
    }
}
