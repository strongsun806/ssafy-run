export interface StageConfig {
    id: number;              // 1 ~ 30
    chapter: number;         // 1: 1~10, 2: 11~20, 3: 21~30
    title: string;           // e.g. "파이썬 기초 입문"
    subtitle: string;        // e.g. "기본 입출력과 변수 선언"
    targetDistance: number;  // Distance required to clear in meters
    themeStage: 1 | 2 | 3;   // Visual stage theme (1: Campus, 2: Stairs, 3: Cyber Lab)
    baseSpeed: number;       // Base runner speed
    hasPits: boolean;        // Whether pits generate
    hasPlatforms: boolean;   // Whether floating platforms generate
    bossType?: 'iltassafy' | 'battlessafy'; // Boss battle trigger
}

export interface StageProgress {
    stars: number; // 0 ~ 3
    highScore: number;
    cleared: boolean;
}

export class StageManager {
    private static readonly PROGRESS_KEY = 'ssafy_run_stage_progress_v1';
    private static readonly UNLOCKED_KEY = 'ssafy_run_highest_stage_v1';

    // 30 Authentic SSAFY-Themed Stages
    public static readonly STAGES: StageConfig[] = [
        // --- CHAPTER 1: 멀캠 입소 & 기초 프로그래밍 (Stages 1 ~ 10) ---
        {
            id: 1, chapter: 1, themeStage: 1, baseSpeed: 380, targetDistance: 100,
            title: '1단계: 멀캠 입소 첫날', subtitle: 'Hello, World! 파이썬 입출력 기초',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 2, chapter: 1, themeStage: 1, baseSpeed: 390, targetDistance: 110,
            title: '2단계: 변수와 메모리', subtitle: '변수 할당과 데이터 타입 기초 익히기',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 3, chapter: 1, themeStage: 1, baseSpeed: 400, targetDistance: 120,
            title: '3단계: if-else 조건문', subtitle: '조건 분기점 장애물 뛰어넘기',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 4, chapter: 1, themeStage: 1, baseSpeed: 410, targetDistance: 130,
            title: '4단계: for 루프 달리기', subtitle: '반복문 속 연속 젤리 획득 레이스',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 5, chapter: 1, themeStage: 1, baseSpeed: 420, targetDistance: 140,
            title: '5단계: 함수와 매개변수', subtitle: '낮은 장애물 아래로 슬라이드 통과',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 6, chapter: 1, themeStage: 1, baseSpeed: 430, targetDistance: 150,
            title: '6단계: 리스트와 딕셔너리', subtitle: '자료구조 정렬과 2단 점프 마스터',
            hasPits: false, hasPlatforms: true
        },
        {
            id: 7, chapter: 1, themeStage: 1, baseSpeed: 440, targetDistance: 160,
            title: '7단계: IndexError 조심!', subtitle: '첫 번째 구덩이(Gap) 출현! 침착하게 도약',
            hasPits: true, hasPlatforms: false
        },
        {
            id: 8, chapter: 1, themeStage: 1, baseSpeed: 440, targetDistance: 170,
            title: '8단계: 공중 2층 발판', subtitle: '재귀 호출처럼 이어지는 공중 플랫폼',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 9, chapter: 1, themeStage: 1, baseSpeed: 450, targetDistance: 180,
            title: '9단계: 1차 월말평가 대비', subtitle: '스피드 업! 고난도 복합 장애물 구간',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 10, chapter: 1, themeStage: 1, baseSpeed: 460, targetDistance: 200,
            title: '10단계: 🎱 [블록코딩] 일타싸피 평가', subtitle: '중간 힐링 타임! 블록코딩으로 당구공을 포켓에 쏙!',
            hasPits: false, hasPlatforms: false, bossType: 'iltassafy'
        },

        // --- CHAPTER 2: 관통 프로젝트 & 비상계단 지옥 (Stages 11 ~ 20) ---
        {
            id: 11, chapter: 2, themeStage: 2, baseSpeed: 460, targetDistance: 200,
            title: '11단계: 8시 55분 비상계단', subtitle: '만원 엘리베이터 탈출! 계단 질주',
            hasPits: false, hasPlatforms: false
        },
        {
            id: 12, chapter: 2, themeStage: 2, baseSpeed: 470, targetDistance: 210,
            title: '12단계: 스택과 큐', subtitle: '선입선출 장애물 연속 회피',
            hasPits: true, hasPlatforms: false
        },
        {
            id: 13, chapter: 2, themeStage: 2, baseSpeed: 475, targetDistance: 220,
            title: '13단계: DFS 깊이우선 탐색', subtitle: '깊은 구덩이를 가뿐히 넘어서는 도약',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 14, chapter: 2, themeStage: 2, baseSpeed: 480, targetDistance: 230,
            title: '14단계: BFS 너비우선 질주', subtitle: '넓게 펼쳐진 코인 라인을 따라 돌파',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 15, chapter: 2, themeStage: 2, baseSpeed: 485, targetDistance: 240,
            title: '15단계: 동적계획법(DP)', subtitle: '최적 부분 구조를 찾아 달리는 고난도 코스',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 16, chapter: 2, themeStage: 2, baseSpeed: 490, targetDistance: 250,
            title: '16단계: Git Conflict 해결', subtitle: '머지 충돌 에러 장애물을 부수고 질주',
            hasPits: true, hasPlatforms: false
        },
        {
            id: 17, chapter: 2, themeStage: 2, baseSpeed: 495, targetDistance: 260,
            title: '17단계: REST API 레이스', subtitle: 'HTTP 500 에러를 피하는 백엔드 질주',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 18, chapter: 2, themeStage: 2, baseSpeed: 500, targetDistance: 270,
            title: '18단계: 프론트엔드 반응형 런', subtitle: '모바일 뷰포트처럼 급변하는 장애물 패턴',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 19, chapter: 2, themeStage: 2, baseSpeed: 505, targetDistance: 280,
            title: '19단계: 관통 마감 1시간 전!', subtitle: '야근의 긴장감! 극한의 멘탈 HP 관리',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 20, chapter: 2, themeStage: 2, baseSpeed: 510, targetDistance: 300,
            title: '20단계: ⚔️ [블록코딩] 배틀싸피 전차전', subtitle: '중간 힐링 타임! 블록코딩으로 사이버 적 전차 격파!',
            hasPits: false, hasPlatforms: false, bossType: 'battlessafy'
        },

        // --- CHAPTER 3: 자율 프로젝트 & 멀캠 11층 수료식 (Stages 21 ~ 30) ---
        {
            id: 21, chapter: 3, themeStage: 3, baseSpeed: 510, targetDistance: 300,
            title: '21단계: 멀캠 11층 코딩 랩', subtitle: '네온 그리드 사이버네틱스 월드 진입',
            hasPits: false, hasPlatforms: true
        },
        {
            id: 22, chapter: 3, themeStage: 3, baseSpeed: 520, targetDistance: 310,
            title: '22단계: AI 딥러닝 파이프라인', subtitle: '초고속 데이터 스트림 사이를 점프',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 23, chapter: 3, themeStage: 3, baseSpeed: 525, targetDistance: 320,
            title: '23단계: 마이크로서비스 아키텍처', subtitle: '분산 발판을 차례차례 밟고 도약',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 24, chapter: 3, themeStage: 3, baseSpeed: 530, targetDistance: 330,
            title: '24단계: Docker 컨테이너 탈출', subtitle: '연속 구덩이와 슬라이드 터널 통과',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 25, chapter: 3, themeStage: 3, baseSpeed: 535, targetDistance: 340,
            title: '25단계: WebSocket 실시간 동기화', subtitle: '한 치의 딜레이도 허용되지 않는 타이밍',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 26, chapter: 3, themeStage: 3, baseSpeed: 540, targetDistance: 350,
            title: '26단계: 클라우드 오토스케일링', subtitle: '점진적 최고속도 700px/s 도달!',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 27, chapter: 3, themeStage: 3, baseSpeed: 550, targetDistance: 360,
            title: '27단계: 최종 프로젝트 데모데이', subtitle: '심사위원 앞 실전 발표처럼 완벽한 런',
            hasPits: true, hasPlatforms: true
        },
        {
            id: 28, chapter: 3, themeStage: 3, baseSpeed: 550, targetDistance: 380,
            title: '28단계: 🎱 [엘리트] 일타싸피 본선', subtitle: '강화된 당구 AI의 초고속 포물선 당구공',
            hasPits: false, hasPlatforms: false, bossType: 'iltassafy'
        },
        {
            id: 29, chapter: 3, themeStage: 3, baseSpeed: 560, targetDistance: 400,
            title: '29단계: ⚔️ [마스터] 배틀싸피 파이널', subtitle: '최종 결전! AI 대전차의 연속 포격 저지',
            hasPits: false, hasPlatforms: false, bossType: 'battlessafy'
        },
        {
            id: 30, chapter: 3, themeStage: 3, baseSpeed: 570, targetDistance: 420,
            title: '30단계: 🎓 SSAFY 최종 수료 & 취업 골인!', subtitle: '전설의 코더! 결승선을 향한 마지막 질주',
            hasPits: true, hasPlatforms: true
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
