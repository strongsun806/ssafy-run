# 🏃‍♂️ SSAFY RUN: OvenBreak

<div align="center">

![SSAFY RUN Banner](https://capsule-render.vercel.app/api?type=waving&color=auto&height=220&section=header&text=SSAFY%20RUN&fontSize=70&fontAlignY=38&desc=지각%20위기!%209시%20입실%20전까지%20멀캠을%20향해%20질주하라!&descAlignY=58&descAlign=50)

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-E255A1?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase Realtime DB](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Deploy%20Pages-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/strongsun806/ssafy-run/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**싸피인을 위한 쿠키런 스타일 웹 횡스크롤 러닝 액션 게임**  
*3단계 테마 맵 · 바닥 구덩이 & 드론 구출 · 일시적 자석 파워업 · 코인 수집 및 캐릭터 스킨 상점*

[🎮 지금 즉시 플레이하기](https://strongsun806.github.io/ssafy-run/) · [🐛 버그 제보](https://github.com/strongsun806/ssafy-run/issues) · [💡 기능 제안](https://github.com/strongsun806/ssafy-run/issues)

</div>

---

## 📸 게임 플레이 시연 화면 (Gameplay Demonstration)

<div align="center">

### 🎮 인게임 플레이 화면 (In-Game Action)
> **구덩이와 공중 발판, 🧲 일시적 자석 파워업, 그리고 2단 점프를 넘나드는 스릴 넘치는 액션!**

![SSAFY RUN 인게임 시연 화면](assets/gameplay_preview.svg)

<br/>

### 🏆 메인 메뉴 & 실시간 전국 명예의 전당 (Realtime Leaderboard)
> **어떤 PC나 모바일에서 플레이해도 Firebase 클라우드 DB를 통해 전국 교육생의 기록이 실시간 동기화됩니다.**

![SSAFY RUN 실시간 전국 명예의 전당](assets/leaderboard_preview.svg)

</div>

---

## 📖 시놉시스 (Story)

> **"오전 8시 50분, 역삼역 3번 출구... 출석 체크 마감까지 남은 시간은 단 10분!**  
> **1층 엘리베이터 앞은 이미 인산인해, 비상계단 문은 저 멀리 보인다.**  
> **쏟아지는 컴파일 에러와 머지 컨플릭트를 뚫고, 9시 입실 체크 QR을 찍어라!"**

**SSAFY RUN**은 SSAFY(삼성청년SW아카데미) 교육생들의 일상을 쿠키런 스타일로 완벽하게 녹여낸 러닝 액션 게임입니다.  
달릴수록 변화하는 3단계 맵을 질주하며 구덩이를 뛰어넘고, 2층 발판을 타고, 코인을 모아 나만의 캐릭터 스킨을 꾸며보세요!

---

## 🌟 새로운 핵심 시스템 & 업데이트 (Cookie Run Edition)

### 1. 🗺️ 3단계 테마 맵 진화 (Multi-Stage Progression)
달린 거리에 따라 배경과 바닥 테마가 실시간으로 변화하며 긴장감이 극대화됩니다:
- **STAGE 1 (0 ~ 500m): 테헤란로 출근길** — 동이 트는 서울 도심 스카이라인과 사이버 보도블럭
- **STAGE 2 (500 ~ 1100m): 비상계단 & 엘리베이터 지옥** — 빨간 경고등과 비상구 녹색 간판, 콘크리트 계단
- **STAGE 3 (1100m+): 멀캠 11층 미래 코딩 랩실** — 깜빡이는 서버랙과 네온 회로 바닥

### 2. 🕳️ 바닥 구덩이(GAP) & 드론 구출 시스템
- 바닥에 실제 낭떠러지 구덩이가 생성됩니다.
- 구덩이 직전에는 **⚠️ GAP** 경고 표시가 나타나며, 타이밍을 맞춰 점프로 뛰어넘어야 합니다.
- 추락 시 30 HP 피해를 입지만, **쿠키런 구출 드론(Rescue Drone)** 이 날아와 즉시 선로로 복귀시켜 줍니다! (HP가 0이 되면 게임 오버).

### 3. 🪜 2층 공중 발판 (Floating Elevated Platforms)
- 바닥 장애물을 피해 공중 발판 위로 점프해 올라갈 수 있습니다.
- 상단 발판에는 대량의 골드 코인(🪙)이 배치되어 있어 숙련된 플레이어에게 더 높은 보상을 제공합니다.

### 4. 🧲 일시적 자석 파워업 & 부스터 아이템
- 자석 효과는 이제 영구가 아닌 **일시적 파워업 아이템(6.5초)** 으로 변경되었습니다.
- 트랙 위의 🧲 자석 아이템을 획득하면 푸른 자기장 오라가 감돌며 주변의 모든 잔디와 코인을 빨아들입니다!

### 5. 🛍️ 코인 경제 & 교육생 캐릭터 꾸미기 상점 (Shop)
- 게임 플레이 중 수집한 골드 코인(🪙)으로 메인 메뉴의 **[🛍️ 스킨 상점]** 에서 다양한 스킨을 구매하고 장착할 수 있습니다:
  - 🟦 **기본 싸피생 (Default Blue)**: 클래식 블루 후드 & 사원증
  - 🟥 **열정의 불꽃 (Red Hoodie)**: 1일 1커밋의 열정을 담은 레드 에디션 (600 코인)
  - ⬛ **네온 사이버 요원 (Cyber Agent)**: 딥블랙 & 시안 네온 바이저 수트 (1,500 코인)
  - 👑 **골든 마스터 (Gold Master)**: 수석 수료생의 순금 왕관 에디션 (3,000 코인)
  - 🐼 **판다 잠옷생 (Panda Pajama)**: 밤샘 코딩으로 지친 귀여운 판다 동물 잠옷 (4,500 코인)

### 6. 🌐 Firebase 연동 실시간 전국 교육생 랭킹
- 메인 화면에 **실시간 전국 명예의 전당 TOP 5가 상시 노출**됩니다.
- 전국의 모든 교육생이 같은 데이터베이스로 순위를 실시간 경쟁할 수 있습니다.

---

## 🎮 조작법 (Controls)

| 동작 | 데스크톱 (키보드) | 모바일 / 터치 스크린 |
| :--- | :--- | :--- |
| **1단 점프 / 2단 점프** | `Space` 또는 `↑` / `W` 키 | **화면 우측 절반** 터치 (또는 JUMP 버튼) |
| **슬라이드 (숙이기)** | `↓` 또는 `S` 키 (길게 누르기) | **화면 좌측 절반** 터치 유지 (또는 SLIDE 버튼) |
| **공중 급강하 (Fast Fall)** | 공중에서 `↓` 또는 `S` 키 | 공중에서 **화면 좌측** 터치 |
| **일시 정지 (PAUSE)** | `P` 또는 `ESC` 키 | 화면 우측 상단 **❚❚** 버튼 클릭 |
| **사운드 ON / OFF** | 화면 우측 상단 버튼 클릭 | 화면 우측 상단 버튼 터치 |

---

## 🧩 인게임 아이템 & 장애물

| 오브젝트 | 이름 | 기능 및 효과 |
| :---: | :--- | :--- |
| 🪙 | **골드 코인** | **+50점 및 코인 +1 획득** (상점에서 캐릭터 스킨 구매 재화) |
| 🌱 | **커밋 잔디** | **+100점** (15콤보 달성 시 골든 피버 발동) |
| 🧲 | **자석 아이템** | **6.5초간 화면의 모든 코인/잔디를 강력하게 자동 흡입** |
| 📱 | **입실 체크 QR** | **+300점** (높은 공중에 위치, 2단 점프로 획득) |
| ☕ | **아이스 아메리카노** | **멘탈(HP) +25 즉시 회복** (생존 필수 아이템) |
| ⚡ | **레드불 부스터** | **5.5초간 무적 대쉬 & 장애물 파괴 & 점수 2배** |
| ❌ | **500 에러 모니터** | 점프로 뛰어넘어야 하는 런타임 에러 장애물 |
| 🚧 | **머지 컨플릭트 배너** | 슬라이드로 통과해야 하는 공중 깃 충돌 장애물 |
| 🕳️ | **바닥 구덩이 (GAP)** | 추락 시 30 HP 피해 및 드론 구출 |

---

## 🛠 기술 스택 (Tech Stack)

| 레이어 | 기술 | 용도 |
| :--- | :--- | :--- |
| **Game Engine** | [Phaser 3](https://phaser.io/) | 2D 캔버스 렌더링, 2400 Arcade Physics 중력 엔진, 씬 관리 |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | 타입 안정성 및 반응형 입력 상태 머신 |
| **Bundler** | [Vite 6.3](https://vitejs.dev/) | 빠른 HMR 개발 서버 및 Terser 기반 고압축 프로덕션 빌드 |
| **Database** | Google Firebase Realtime DB | 전 기기 실시간 온라인 랭킹 동기화 REST API |
| **Storage** | LocalStorage | 보유 코인, 보유 스킨, 착용 스킨 영구 보존 |
| **Audio** | Web Audio API | 절차적 8비트 사운드 FX 및 칩튠 BGM 실시간 합성 |
| **CI/CD** | GitHub Actions | `main` 브랜치 푸시 시 GitHub Pages 자동 빌드 & 배포 |

---

## 🚀 로컬 실행 방법 (Getting Started)

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

---

## 📜 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
