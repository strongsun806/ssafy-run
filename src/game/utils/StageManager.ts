export interface StageConfig {
    id: number;              // 1 ~ 30
    chapter: number;         // 1: 1~10, 2: 11~20, 3: 21~30
    title: string;
    subtitle: string;
    targetDistance: number;  // Distance required to clear in meters
    themeStage: 1 | 2 | 3;   // Visual stage theme (1: Campus, 2: Stairs, 3: Cyber Lab)
    baseSpeed: number;       // Base runner speed (px/s)
    waveIntervalMs: number;  // Delay between obstacle patterns (lower = harder/denser)
    pitChance: number;       // 0.0 ~ 0.65 probability of pits
    hasPlatforms: boolean;
    bossType?: 'iltassafy' | 'battlessafy';
}

export interface StageProgress {
    stars: number; // 0 ~ 3
    highScore: number;
    cleared: boolean;
}

export class StageManager {
    private static readonly PROGRESS_KEY = 'ssafy_run_stage_progress_v1';
    private static readonly UNLOCKED_KEY = 'ssafy_run_highest_stage_v1';

    public static readonly STAGES: StageConfig[] = [
        // --- CHAPTER 1: 테헤란로 출근길 (Stages 1 ~ 10) ---
        {
            id: 1, chapter: 1, themeStage: 1, baseSpeed: 380, waveIntervalMs: 1350, pitChance: 0.15, targetDistance: 260,
            title: '1단계: 역삼역 3번 출구', subtitle: '기본 점프와 슬라이드, 첫 구덩이 돌파',
            hasPlatforms: false
        },
        {
            id: 2, chapter: 1, themeStage: 1, baseSpeed: 386, waveIntervalMs: 1300, pitChance: 0.2, targetDistance: 290,
            title: '2단계: 테헤란로 횡단보도', subtitle: '점프 직후 연속 슬라이드 복합 패턴',
            hasPlatforms: true
        },
        {
            id: 3, chapter: 1, themeStage: 1, baseSpeed: 392, waveIntervalMs: 1250, pitChance: 0.24, targetDistance: 320,
            title: '3단계: 출근길 인파 돌파', subtitle: '2단 점프 장애물과 빠른 급강하 컨트롤',
            hasPlatforms: true
        },
        {
            id: 4, chapter: 1, themeStage: 1, baseSpeed: 398, waveIntervalMs: 1200, pitChance: 0.28, targetDistance: 350,
            title: '4단계: 커피 테이크아웃 질주', subtitle: '연속 구덩이와 공중 장애물의 결합',
            hasPlatforms: true
        },
        {
            id: 5, chapter: 1, themeStage: 1, baseSpeed: 405, waveIntervalMs: 1160, pitChance: 0.3, targetDistance: 380,
            title: '5단계: 8시 50분 타임어택', subtitle: '날아오는 버그 드론 회피',
            hasPlatforms: true
        },
        {
            id: 6, chapter: 1, themeStage: 1, baseSpeed: 410, waveIntervalMs: 1120, pitChance: 0.33, targetDistance: 410,
            title: '6단계: 2층 발판 징검다리', subtitle: '바닥 구덩이 위 공중 발판 연속 도약',
            hasPlatforms: true
        },
        {
            id: 7, chapter: 1, themeStage: 1, baseSpeed: 416, waveIntervalMs: 1080, pitChance: 0.35, targetDistance: 440,
            title: '7단계: 런타임 에러 폭주', subtitle: '고밀도 장애물 러시와 칼타이밍 점프',
            hasPlatforms: true
        },
        {
            id: 8, chapter: 1, themeStage: 1, baseSpeed: 422, waveIntervalMs: 1040, pitChance: 0.38, targetDistance: 470,
            title: '8단계: 멀캠 정문 로비 진입', subtitle: '슬라이드 터널과 낭떠러지 구간',
            hasPlatforms: true
        },
        {
            id: 9, chapter: 1, themeStage: 1, baseSpeed: 428, waveIntervalMs: 1000, pitChance: 0.4, targetDistance: 500,
            title: '9단계: 1차 과목평가 직전', subtitle: '쉴 틈 없는 연속 복합 패턴',
            hasPlatforms: true
        },
        {
            id: 10, chapter: 1, themeStage: 1, baseSpeed: 435, waveIntervalMs: 980, pitChance: 0.35, targetDistance: 530,
            title: '10단계: 일타싸피 보스전', subtitle: '당구 AI 보스 레이드 & 알고리즘 컴파일',
            hasPlatforms: true, bossType: 'iltassafy'
        },

        // --- CHAPTER 2: 비상계단 & 관통 프로젝트 (Stages 11 ~ 20) ---
        {
            id: 11, chapter: 2, themeStage: 2, baseSpeed: 440, waveIntervalMs: 960, pitChance: 0.38, targetDistance: 550,
            title: '11단계: 만원 엘리베이터 탈출', subtitle: '비상계단 진입! 좁아진 착지 판정',
            hasPlatforms: true
        },
        {
            id: 12, chapter: 2, themeStage: 2, baseSpeed: 446, waveIntervalMs: 940, pitChance: 0.4, targetDistance: 580,
            title: '12단계: 스택 오버플로우', subtitle: '2연속 점프 후 즉시 슬라이드 요구 구간',
            hasPlatforms: true
        },
        {
            id: 13, chapter: 2, themeStage: 2, baseSpeed: 452, waveIntervalMs: 920, pitChance: 0.42, targetDistance: 610,
            title: '13단계: DFS 백트래킹 미로', subtitle: '넓어진 구덩이와 버그 미사일',
            hasPlatforms: true
        },
        {
            id: 14, chapter: 2, themeStage: 2, baseSpeed: 458, waveIntervalMs: 900, pitChance: 0.44, targetDistance: 640,
            title: '14단계: BFS 최단경로 돌파', subtitle: '2층 공중 발판과 지상 장애물 동시 압박',
            hasPlatforms: true
        },
        {
            id: 15, chapter: 2, themeStage: 2, baseSpeed: 465, waveIntervalMs: 880, pitChance: 0.45, targetDistance: 670,
            title: '15단계: 동적계획법(DP) 점화식', subtitle: '정교한 타이밍이 필요한 중반부 고비',
            hasPlatforms: true
        },
        {
            id: 16, chapter: 2, themeStage: 2, baseSpeed: 470, waveIntervalMs: 860, pitChance: 0.46, targetDistance: 700,
            title: '16단계: Git Merge 충돌 지옥', subtitle: '연속 공중 배너와 바닥 모니터 교차 출현',
            hasPlatforms: true
        },
        {
            id: 17, chapter: 2, themeStage: 2, baseSpeed: 476, waveIntervalMs: 840, pitChance: 0.48, targetDistance: 730,
            title: '17단계: 500 서버 에러 폭격', subtitle: '에러 모니터 연속 배치 돌파',
            hasPlatforms: true
        },
        {
            id: 18, chapter: 2, themeStage: 2, baseSpeed: 482, waveIntervalMs: 820, pitChance: 0.5, targetDistance: 760,
            title: '18단계: 비동기 콜백 지옥', subtitle: '비행 버그와 구덩이 콤보',
            hasPlatforms: true
        },
        {
            id: 19, chapter: 2, themeStage: 2, baseSpeed: 488, waveIntervalMs: 800, pitChance: 0.52, targetDistance: 790,
            title: '19단계: 마감 10분 전 핫픽스', subtitle: '집중력을 요구하는 복합 패턴',
            hasPlatforms: true
        },
        {
            id: 20, chapter: 2, themeStage: 2, baseSpeed: 495, waveIntervalMs: 790, pitChance: 0.45, targetDistance: 820,
            title: '20단계: 배틀싸피 전차 보스전', subtitle: '중무장 전차의 포격 회피 및 반격 레이드',
            hasPlatforms: true, bossType: 'battlessafy'
        },

        // --- CHAPTER 3: 멀캠 11층 코딩 랩실 (Stages 21 ~ 30) ---
        {
            id: 21, chapter: 3, themeStage: 3, baseSpeed: 500, waveIntervalMs: 780, pitChance: 0.48, targetDistance: 850,
            title: '21단계: 11층 사이버 랩실', subtitle: '사이버 트랙 진입',
            hasPlatforms: true
        },
        {
            id: 22, chapter: 3, themeStage: 3, baseSpeed: 506, waveIntervalMs: 760, pitChance: 0.5, targetDistance: 880,
            title: '22단계: GPU 클러스터 과부하', subtitle: '밀집 장애물과 급강하 컨트롤',
            hasPlatforms: true
        },
        {
            id: 23, chapter: 3, themeStage: 3, baseSpeed: 512, waveIntervalMs: 740, pitChance: 0.52, targetDistance: 910,
            title: '23단계: 제로데이 취약점 방어', subtitle: '연속 구덩이 위 비행 버그 동시 회피',
            hasPlatforms: true
        },
        {
            id: 24, chapter: 3, themeStage: 3, baseSpeed: 518, waveIntervalMs: 720, pitChance: 0.54, targetDistance: 940,
            title: '24단계: 컨테이너 오케스트레이션', subtitle: '공중 발판 연속 도약 마스터 코스',
            hasPlatforms: true
        },
        {
            id: 25, chapter: 3, themeStage: 3, baseSpeed: 525, waveIntervalMs: 700, pitChance: 0.55, targetDistance: 980,
            title: '25단계: 실시간 패킷 스트림', subtitle: '고밀도 복합 패턴 테스트 구간',
            hasPlatforms: true
        },
        {
            id: 26, chapter: 3, themeStage: 3, baseSpeed: 532, waveIntervalMs: 685, pitChance: 0.56, targetDistance: 1020,
            title: '26단계: 대규모 트래픽 폭주', subtitle: '연속 복합 장애물 웨이브',
            hasPlatforms: true
        },
        {
            id: 27, chapter: 3, themeStage: 3, baseSpeed: 538, waveIntervalMs: 670, pitChance: 0.58, targetDistance: 1060,
            title: '27단계: 최종 발표 데모데이', subtitle: '정확한 점프/슬라이드 마스터 트랙',
            hasPlatforms: true
        },
        {
            id: 28, chapter: 3, themeStage: 3, baseSpeed: 545, waveIntervalMs: 660, pitChance: 0.52, targetDistance: 1100,
            title: '28단계: 일타싸피 마스터 본선', subtitle: '당구 AI 보스 결전',
            hasPlatforms: true, bossType: 'iltassafy'
        },
        {
            id: 29, chapter: 3, themeStage: 3, baseSpeed: 552, waveIntervalMs: 650, pitChance: 0.55, targetDistance: 1150,
            title: '29단계: 배틀싸피 파이널 결전', subtitle: '최강 전차 보스의 포격 돌파',
            hasPlatforms: true, bossType: 'battlessafy'
        },
        {
            id: 30, chapter: 3, themeStage: 3, baseSpeed: 560, waveIntervalMs: 640, pitChance: 0.6, targetDistance: 1200,
            title: '30단계: 최종 수료 & 마스터 등극', subtitle: '최종 캠퍼스 완주 코스',
            hasPlatforms: true
        }
    ];

    public static getHighestUnlockedStage(): number {
        const val = localStorage.getItem(this.UNLOCKED_KEY);
        return val ? Math.min(30, Math.max(1, parseInt(val, 10))) : 1;
    }

    public static unlockNextStage(currentStageId: number): void {
        const currentHighest = this.getHighestUnlockedStage();
        if (currentStageId >= currentHighest && currentStageId < 30) {
            localStorage.setItem(this.UNLOCKED_KEY, (currentStageId + 1).toString());
        }
    }

    public static getStageProgress(stageId: number): StageProgress {
        try {
            const raw = localStorage.getItem(`${this.PROGRESS_KEY}_${stageId}`);
            if (raw) return JSON.parse(raw);
        } catch {
            // Ignore
        }
        return { stars: 0, highScore: 0, cleared: false };
    }

    public static saveStageProgress(stageId: number, stars: number, score: number): void {
        const prev = this.getStageProgress(stageId);
        const updated: StageProgress = {
            stars: Math.max(prev.stars, stars),
            highScore: Math.max(prev.highScore, score),
            cleared: true
        };
        localStorage.setItem(`${this.PROGRESS_KEY}_${stageId}`, JSON.stringify(updated));
        this.unlockNextStage(stageId);
    }

    public static getTotalStars(): number {
        let total = 0;
        for (let i = 1; i <= 30; i++) {
            total += this.getStageProgress(i).stars;
        }
        return total;
    }

    public static getStageConfig(stageId: number): StageConfig {
        const found = this.STAGES.find(s => s.id === stageId);
        return found || this.STAGES[0];
    }
}
