# 🏃‍♂️ SSAFY RUN: OvenBreak

<div align="center">

![SSAFY RUN Banner](https://capsule-render.vercel.app/api?type=waving&color=auto&height=220&section=header&text=SSAFY%20RUN&fontSize=70&fontAlignY=38&desc=지각%20위기!%209시%20입실%20전까지%20멀캠을%20향해%20질주하라!&descAlignY=58&descAlign=50)

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-E255A1?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Deploy%20Pages-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/strongsun806/ssafy-run/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**싸피인을 위한 웹 기반 횡스크롤 러닝 액션 게임**  
*PC 키보드 & 모바일 터치 온스크린 컨트롤 지원 · 절차적 8비트 사운드트랙 · 실시간 명예의 전당*

[🎮 즉시 게임 플레이하기](https://strongsun806.github.io/ssafy-run/) · [🐛 버그 제보](https://github.com/strongsun806/ssafy-run/issues) · [💡 기능 제안](https://github.com/strongsun806/ssafy-run/issues)

</div>

---

## 📖 시놉시스 (Story)

> **"오전 8시 50분, 역삼역 3번 출구... 출석 체크 마감까지 남은 시간은 단 10분!**  
> **1층 엘리베이터 앞은 이미 인산인해, 비상계단 문은 저 멀리 보인다.**  
> **쏟아지는 컴파일 에러와 머지 컨플릭트를 뚫고, 9시 입실 체크 QR을 찍어라!"**

**SSAFY RUN**은 SSAFY(삼성청년SW아카데미) 교육생들의 리얼한 일상을 모티브로 제작된 쿠키런 스타일의 웹 기반 횡스크롤 러닝 게임입니다.  
교육생 캐릭터는 매일 마주치는 런타임 에러와 깃 충돌을 점프와 슬라이드로 피하고, 잔디(커밋)와 입실 QR, 아이스 아메리카노를 챙겨 멘탈을 회복하며 멀티캠퍼스를 향해 전력 질주해야 합니다.

---

## 🌟 핵심 게임 특징 (Key Highlights)

1. **반응형 캔버스 & 모바일 온스크린 가상 패드**
   - 데스크톱/태블릿/스마트폰 모든 기기 비율에 맞춘 자동 스케일링(`Phaser.Scale.FIT`).
   - 모바일 화면 터치 시 왼쪽 하단 `SLIDE`, 오른쪽 하단 `JUMP` 가상 버튼 제공 및 멀티터치 완벽 지원.

2. **절차적 8비트 Web Audio 사운드 엔진**
   - 별도 외부 MP3/WAV 파일 로딩 실패 없는 100% 브라우저 내장 Web Audio API 신디사이저 탑재.
   - 점프, 2단 점프, 슬라이드, 젤리 획득, 피버 진입, 피격 및 레트로 칩튠 BGM 구현 (상단 음소거 🔊/🔇 토글 제공).

3. **콤보 & 골든 피버(Fever) 모드**
   - 커밋 젤리를 연속으로 수집하면 콤보 배수(x2, x3) 적용.
   - 15콤보 달성 또는 에너지 드링크 획득 시 5.5초간 **골든 피버 모드** 발동! (장애물 파괴 가능, 점수 2배).

4. **멀티 레이어 패럴랙스 배경 (Parallax Scrolling)**
   - 동이 트는 서울 도심 스카이라인, 멀티캠퍼스 빌딩 및 전광판 네온사인이 속도감 있게 흘러가는 3중 시차 스크롤 연출.

5. **명예의 전당 (Local Leaderboard Top 5) & 소셜 공유**
   - 로컬 스토리지(`localStorage`) 기반 최고 점수 저장 및 닉네임 등록 명예의 전당 지원.
   - 게임 오버 시 최종 점수, 이동 거리, 수집 아이템 상세 분석 및 클립보드 점수 복사 공유 기능.

---

## 🎮 조작법 (Controls)

| 동작 | 데스크톱 (키보드) | 모바일 / 터치 스크린 |
| :--- | :--- | :--- |
| **1단 점프 / 2단 점프** | `Space` 또는 `↑` / `W` 키 | 화면 우측 하단 **JUMP** 버튼 터치 |
| **슬라이드 (숙이기)** | `↓` 또는 `S` 키 (길게 누르기) | 화면 좌측 하단 **SLIDE** 버튼 터치 |
| **일시 정지 (PAUSE)** | `P` 또는 `ESC` 키 | 화면 우측 상단 **❚❚** 버튼 클릭 |
| **사운드 ON / OFF** | 화면 우측 상단 버튼 클릭 | 화면 우측 상단 버튼 터치 |

---

## 🧩 인게임 오브젝트 & 규칙 (Game Elements)

### 1. 아이템 & 젤리

| 아이템 | 이름 | 효과 & 설명 |
| :---: | :--- | :--- |
| 🌱 | **커밋 잔디** | **+100 Score** (연속 수집 시 콤보 배수 증가) |
| 📱 | **입실 체크 QR** | **+300 Score** (공중에 위치, 2단 점프로 획득) |
| ☕ | **아이스 아메리카노** | **+25 멘탈(HP) 즉시 회복** (초당 자연 감소 상쇄) |
| ⚡ | **레드불 부스터** | **골든 피버 모드 진입** (5.5초간 무적, 장애물 파괴, 점수 2배) |

### 2. 장애물

| 장애물 | 분류 | 회피 방법 및 주의점 |
| :---: | :--- | :--- |
| ❌ | **500 에러 터미널 / 버그 로봇** | **지상 장애물** — 1단 또는 2단 점프로 회피 |
| 🚧 | **머지 컨플릭트 배너** | **공중 장애물** — 슬라이드(숙이기) 자세로 밑으로 통과 |

### 3. 시스템 규칙

- **멘탈 게이지 (HP)**: 게임 시작 시 100%에서 시작하며, 초당 일정량이 자연 감소합니다.
- **장애물 충돌**: 충돌 시 멘탈 20% 감소, 콤보 초기화 및 1.2초간 무적 깜빡임 연출이 적용됩니다.
- **가속 시스템**: 달린 거리가 길어질수록 스크롤 속도가 점진적으로 가속됩니다 (최대 820px/s).
- **게임 오버 판정**: 멘탈이 0%에 도달하면 즉시 종료되며 최종 스코어 및 수료 등급이 산정됩니다.

---

## 🏆 성적표 등급 기준 (Result Ranks)

게임 오버 시 최종 점수에 따라 SSAFY 특별 칭호가 부여됩니다:

- 👑 **8,000점 이상**: `SSS급 SSAFY 수석 개발자` (빌드 완벽 & 8시 40분 여유 입실)
- 🔥 **5,000점 이상**: `열혈 1일 1커밋터` (9시 정각 세이프 & 에러 완파)
- ☕ **3,000점 이상**: `아아 수혈 스프린터` (아슬아슬 8시 59분 입실 성공)
- 🏃‍♂️ **1,500점 이상**: `비상계단 전력질주생` (엘리베이터 만원으로 계단 등반)
- 💀 **1,500점 미만**: `멘탈 붕괴 지각생` (9시 01분 출석 불가... 내일은 일찍 오자!)

---

## 🛠 기술 스택 (Tech Stack)

| 레이어 | 기술 | 용도 |
| :--- | :--- | :--- |
| **Game Engine** | [Phaser 3](https://phaser.io/) | 2D 캔버스 렌더링, 아케이드 물리 엔진, 씬 관리 |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | 엄격한 타입 안정성 및 객체 지향 구조 설계 |
| **Bundler** | [Vite 6.3](https://vitejs.dev/) | 빠른 HMR 개발 서버 및 Terser 기반 고압축 프로덕션 빌드 |
| **Audio** | Web Audio API | 절차적 8비트 사운드 FX 및 칩튠 BGM 실시간 합성 |
| **CI/CD** | GitHub Actions | `main` 브랜치 푸시 시 GitHub Pages 자동 빌드 & 배포 |

---

## 📂 프로젝트 구조 (Project Architecture)

```bash
ssafy-run/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포 CI/CD
├── public/                     # 정적 웹 에셋 (파비콘, 기본 스타일)
│   ├── favicon.png
│   ├── style.css
│   └── assets/                 # 배경 및 로고
├── src/
│   ├── game/
│   │   ├── objects/
│   │   │   └── Player.ts       # 플레이어 물리, 상태 머신, 가상 패드 연동
│   │   ├── scenes/
│   │   │   ├── Boot.ts         # 필수 에셋 초기 로드
│   │   │   ├── Preloader.ts    # 프로시저럴 텍스처 생성 & 로딩 바
│   │   │   ├── MainMenu.ts     # 타이틀, 튜토리얼 팝업, 명예의 전당
│   │   │   ├── Game.ts         # 메인 인게임 씬 (패럴랙스, 스폰, 콤보, HUD)
│   │   │   └── GameOver.ts     # 결과 리포트, 랭킹 등록, 공유
│   │   ├── utils/
│   │   │   ├── AudioManager.ts # Web Audio API 기반 효과음 및 BGM 합성기
│   │   │   ├── ScoreManager.ts # 로컬 스토리지 하이스코어 및 리더보드
│   │   │   └── TextureGenerator.ts # Canvas API 기반 동적 스프라이트 생성기
│   │   └── main.ts             # Phaser Game 설정 (1280x720, Arcade Physics)
│   ├── index.html              # 모바일 최적화 뷰포트 메타태그 설정
│   └── main.ts                 # 브라우저 DOM 엔트리포인트
├── vite/                       # Vite dev & prod 환경설정
├── package.json
└── tsconfig.json
```

---

## 🚀 로컬 실행 방법 (Getting Started)

### 사전 요구사항
* Node.js 18.x 이상
* npm 또는 pnpm

### 설치 및 로컬 서버 실행

```bash
# 1. 레포지토리 클론
git clone https://github.com/strongsun806/ssafy-run.git

# 2. 프로젝트 디렉토리 이동
cd ssafy-run

# 3. 의존성 패키지 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:8080/`으로 접속하면 즉시 플레이할 수 있습니다.

### 프로덕션 빌드

```bash
# 정적 웹 번들 빌드 (dist/ 폴더 생성)
npm run build-nolog
```

---

## 🌐 배포 가이드 (Deployment)

### GitHub Pages 자동 배포 (권장)
본 저장소에는 `.github/workflows/deploy.yml` 워크플로우가 구성되어 있습니다.
1. GitHub 저장소의 **Settings** > **Pages** 이동
2. **Build and deployment** > **Source**를 `GitHub Actions`로 선택
3. `main` 브랜치에 코드를 Push하면 GitHub Actions가 빌드를 완료하고 Pages에 자동 배포합니다.

---

## 📜 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
