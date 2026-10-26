# 🏃‍♂️ SSAFY RUN: OvenBreak

<div align="center">

![SSAFY RUN Banner](https://capsule-render.vercel.app/api?type=waving&color=auto&height=220&section=header&text=SSAFY%20RUN&fontSize=70&fontAlignY=38&desc=지각%20위기!%209시%20입실%20전까지%20멀캠을%20향해%20질주하라!&descAlignY=58&descAlign=50)

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-E255A1?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Deploy%20Pages-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/strongsun806/ssafy-run/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**싸피인을 위한 웹 기반 횡스크롤 러닝 액션 게임**  
*PC 키보드 & 모바일 화면 분할 터치 · 즉각 반응 조작감 · 실시간 전국 교육생 온라인 랭킹*

[🎮 즉시 게임 플레이하기](https://strongsun806.github.io/ssafy-run/) · [🐛 버그 제보](https://github.com/strongsun806/ssafy-run/issues) · [💡 기능 제안](https://github.com/strongsun806/ssafy-run/issues)

</div>

---

## 📖 시놉시스 (Story)

> **"오전 8시 50분, 역삼역 3번 출구... 출석 체크 마감까지 남은 시간은 단 10분!**  
> **1층 엘리베이터 앞은 이미 인산인해, 비상계단 문은 저 멀리 보인다.**  
> **쏟아지는 컴파일 에러와 머지 컨플릭트를 뚫고, 9시 입실 체크 QR을 찍어라!"**

**SSAFY RUN**은 SSAFY(삼성청년SW아카데미) 교육생들의 리얼한 일상을 모티브로 제작된 쿠키런 스타일의 웹 기반 횡스크롤 러닝 액션 게임입니다.  
교육생 캐릭터는 매일 마주치는 런타임 에러와 깃 충돌을 점프와 슬라이드로 피하고, 잔디(커밋)와 입실 QR, 아이스 아메리카노를 챙겨 멘탈을 회복하며 멀티캠퍼스를 향해 전력 질주해야 합니다.

---

## 🌟 최신 주요 업데이트 & 핵심 특징 (Key Highlights)

1. **⚡ 즉각적인 액션 & 반응속도 개선 (Zero-Lag Controls)**
   - **점프 버퍼(Jump Buffer, 160ms)**: 착지 직전 살짝 일찍 점프를 눌러도 착지와 동시에 즉시 점프가 발동되어 키 씹힘 현상을 완전히 해결했습니다.
   - **코요테 타임(Coyote Time, 100ms)**: 발판이나 착지 직후 찰나의 순간에도 점프가 유연하게 인식됩니다.
   - **공중 급강하(Fast Fall / Dive)**: 공중에서 슬라이드(↓ / S 또는 화면 좌측 터치)를 누르면 바닥으로 즉시 급강하하여 장애물을 날렵하게 회피합니다.
   - **가변 점프 높이**: 점프 키를 짧게 탭하면 낮은 점프, 길게 누르면 높은 점프를 구사할 수 있습니다.

2. **📱 모바일 화면 분할 터치 조작 (Split-Screen Touch)**
   - 작은 가상 버튼을 굳이 조준할 필요 없이, **화면 왼쪽 절반 터치 = 슬라이드**, **화면 오른쪽 절반 터치 = 점프**로 언제 어디서든 엄지손가락으로 시원하게 플레이 가능합니다.

3. **🌊 유기적인 웨이브 레벨 디자인 (Choreographed Patterns)**
   - 장애물과 아이템이 무작위로 겹쳐서 불가능한 상황이 발생하던 문제를 해결하고, 6가지 테마형 웨이브로 재설계했습니다:
     - **점프 회피 웨이브**: 지상 장애물 위에 포물선 모양으로 잔디가 배치되어, 잔디 궤적만 따라 점프하면 자연스럽게 장애물이 피해집니다!
     - **슬라이드 터널 웨이브**: 머지 컨플릭트 배너 아래로 바닥 잔디가 이어져 자연스러운 슬라이딩 유도.
     - **2단 점프 & QR 보너스 웨이브**: 높은 공중에 QR 코드가 배치되어 더블 점프로 보너스 획득.
     - **아메리카노 충전 & 골든 피버 질주 웨이브**: 안정적인 회복과 시원한 무적 질주.

4. **🌐 실시간 전국 교육생 온라인 랭킹 (Global Leaderboard TOP 10)**
   - 로컬 브라우저에만 저장되던 한계를 넘어, **온라인 실시간 랭킹 시스템**을 연동했습니다.
   - 전국 각 캠퍼스의 교육생들이 달성한 점수를 실시간으로 확인하고, 내 닉네임을 TOP 10 명예의 전당에 등록할 수 있습니다!

5. **🎵 절차적 8비트 Web Audio 사운드 엔진**
   - 별도 외부 MP3 파일 로딩 없이 브라우저 내장 Web Audio API로 실시간 음향 합성 (음소거 🔊/🔇 토글 제공).

---

## 🎮 조작법 (Controls)

| 동작 | 데스크톱 (키보드) | 모바일 / 터치 스크린 |
| :--- | :--- | :--- |
| **1단 점프 / 2단 점프** | `Space` 또는 `↑` / `W` 키 | **화면 우측 절반** 어디든 터치 (또는 JUMP 버튼) |
| **슬라이드 (숙이기)** | `↓` 또는 `S` 키 (길게 누르기) | **화면 좌측 절반** 터치 유지 (또는 SLIDE 버튼) |
| **공중 급강하 (Fast Fall)** | 공중에서 `↓` 또는 `S` 키 | 공중에서 **화면 좌측** 터치 |
| **일시 정지 (PAUSE)** | `P` 또는 `ESC` 키 | 화면 우측 상단 **❚❚** 버튼 클릭 |
| **사운드 ON / OFF** | 화면 우측 상단 버튼 클릭 | 화면 우측 상단 버튼 터치 |

---

## 🧩 인게임 오브젝트 & 규칙 (Game Elements)

### 1. 아이템 & 젤리

| 아이템 | 이름 | 효과 & 설명 |
| :---: | :--- | :--- |
| 🌱 | **커밋 잔디** | **+100 Score** (연속 수집 시 콤보 배수 및 15콤보 시 피버 모드) |
| 📱 | **입실 체크 QR** | **+300 Score** (공중에 위치, 2단 점프로 획득) |
| ☕ | **아이스 아메리카노** | **+25 멘탈(HP) 즉시 회복** (초당 자연 감소 상쇄) |
| ⚡ | **레드불 부스터** | **골든 피버 모드 진입** (5.5초간 무적, 장애물 파괴 점수, 점수 2배) |

### 2. 장애물

| 장애물 | 분류 | 회피 방법 및 팁 |
| :---: | :--- | :--- |
| ❌ | **500 에러 터미널 / 버그 로봇** | **지상 장애물** — 잔디 포물선을 따라 1단 점프로 자연스럽게 회피 |
| 🚧 | **머지 컨플릭트 배너** | **공중 장애물** — 바닥 잔디 라인을 따라 슬라이드로 통과 (공중에선 급강하) |

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
| **Game Engine** | [Phaser 3](https://phaser.io/) | 2D 캔버스 렌더링, 2400 Arcade Physics 중력 물리 엔진, 씬 관리 |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | 엄격한 타입 안정성 및 반응형 입력 상태 머신 |
| **Bundler** | [Vite 6.3](https://vitejs.dev/) | 빠른 HMR 개발 서버 및 Terser 기반 고압축 프로덕션 빌드 |
| **Backend & API** | Cloud Key-Value API | 실시간 전국 교육생 랭킹 데이터 동기화 및 LocalStorage 폴백 |
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
