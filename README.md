
# 🏃‍♂️ SSAFY RUN: OvenBreak

<div align="center">

![SSAFY RUN Banner](https://capsule-render.vercel.app/api?type=waving&color=auto&height=220&section=header&text=SSAFY%20RUN&fontSize=70&fontAlignY=38&desc=지각%20위기!%209시%20입실%20전까지%20멀캠을%20향해%20질주하라!&descAlignY=58&descAlign=50)

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-E255A1?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**싸피인을 위한 웹 기반 횡스크롤 러닝 액션 게임**  
*PC 키보드 및 모바일 터치 완벽 지원 & 실시간 교육생 리더보드 연동*

[🎮 게임 플레이하기](https://strongsun806.github.io/ssafy-run/) · [🐛 버그 제보](https://github.com/strongsun806/ssafy-run/issues) · [💡 기능 제안](https://github.com/strongsun806/ssafy-run/issues)

</div>

---

## 📖 About The Project

> **"출석 마감까지 남은 시간 단 10분... 엘리베이터는 만원이고 비상계단은 멀다!"**

**SSAFY RUN**은 쿠키런 스타일의 캐주얼 러닝 게임입니다.  
교육생들이 매일 마주하는 개발 에러와 빌드 실패를 점프와 슬라이드로 피하고, 잔디(커밋)와 입실 체크 QR을 모으며 멘탈을 유지해 살아남아야 합니다.

### 🌟 Key Highlights
- **반응형 게임 엔진**: 모바일/데스크톱 화면 비율에 최적화된 Canvas 렌더링
- **경쾌한 조작감**: 2단 점프, 슬라이드 판정 및 즉각적인 물리 피드백
- **싸피 맞춤형 이스터에그**: 입실 체크 QR, 1일 1커밋 잔디, 멘탈 회복 아메리카노
- **실시간 리더보드**: 반별 / 캠퍼스별 최고 득점자 랭킹 시스템 연동 예정

---

## 🎮 Game Controls

| 동작 | PC (키보드) | 모바일 (화면 터치) |
| :--- | :--- | :--- |
| **1단 점프 / 2단 점프** | `Space` 또는 `↑` 키 | 화면 우측 하단 **JUMP** 버튼 |
| **슬라이드 (숙이기)** | `↓` 키 (길게 누르기) | 화면 좌측 하단 **SLIDE** 버튼 |

---

## 🧩 In-Game Elements

### 1. 아이템 & 젤리
- 🌱 **커밋 잔디**: 1일 1커밋의 결실 (+100 Score)
- 📱 **입실 체크 QR**: 8시 59분 세이프 보너스 (+300 Score)
- ☕ **아이스 아메리카노**: 꺾이지 않는 개발자의 영혼 (+25 Mental HP 회복)

### 2. 장애물
- ⚠️ **지상 장애물 (빨간 에러 블록)**: 점프로 뛰어넘어야 하는 런타임 에러
- 🚧 **공중 장애물 (주황 경고 블록)**: 슬라이드로 회피해야 하는 머지 컨플릭트

### 3. 시스템 규칙
- **멘탈 게이지 (HP)**: 시간이 지날수록 초당 일정량 자연 감소
- **피격 판정**: 장애물 충돌 시 멘탈 대폭 감소 & 1초간 깜빡임 무적
- **게임 오버**: 멘탈이 0이 되면 게임 종료 후 최종 스코어 기록

---

## 🛠 Tech Stack

- **Core**: Phaser 3 (Arcade Physics Engine)
- **Language**: TypeScript
- **Bundler**: Vite
- **Deployment**: GitHub Pages / Netlify

---

## 📂 Project Structure

```bash
ssafy-run/
├── public/                 # 정적 에셋 (이미지, 사운드 등)
├── src/
│   ├── game/
│   │   ├── objects/        # 독립 게임 객체 (Player, Obstacle 등)
│   │   │   └── Player.ts
│   │   ├── scenes/         # Phaser 게임 씬 관리
│   │   │   ├── Boot.ts
│   │   │   ├── Preloader.ts
│   │   │   ├── MainMenu.ts
│   │   │   ├── Game.ts     # 핵심 인게임 플레이 씬
│   │   │   └── GameOver.ts # 결과 및 랭킹 등록 씬
│   │   └── main.ts         # Phaser Game 인스턴스 설정
│   ├── index.html
│   └── main.ts             # 엔트리포인트
├── package.json
└── tsconfig.json

```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.x 이상
* npm 또는 pnpm

### Installation

```bash
# 레포지토리 클론
git clone [https://github.com/strongsun806/ssafy-run.git](https://github.com/strongsun806/ssafy-run.git)

# 프로젝트 디렉토리 이동
cd ssafy-run

# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

```

브라우저에서 `http://localhost:8080/`으로 접속하여 플레이할 수 있습니다.

---

## 🗺 Roadmap

* [x] 기본 물리 엔진 및 2단 점프 / 슬라이드 구현
* [x] 커밋 젤리 수집 및 점수 시스템
* [x] 멘탈 게이지 및 아메리카노 회복 아이템
* [ ] 멀티 레이어 패럴랙스 배경 (교실/빌딩 뷰)
* [ ] 모바일 전용 온스크린 터치 컨트롤
* [ ] SSAFY 교육생 실시간 랭킹 시스템 (Supabase / Firebase 연동)

---