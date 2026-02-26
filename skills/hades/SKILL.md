---
name: hades
description: 한국 주식(KOSPI/KOSDAQ) 데이터 조회 및 백테스팅 CLI 툴킷. 증권거래세 개정연혁 포함. 주식 데이터 동기화, 종목 조회, OHLCV 데이터, 외국인 매매동향, 백테스팅 실행 시 사용. 사용자가 한국 주식 백테스트, 종목 데이터, 외인 수급, 모멘텀 전략, 거래세율 확인을 요청할 때 트리거.
---

# Hades — 한국 주식 데이터 & 백테스팅 툴킷

GitHub: https://github.com/junhoyeo/hades  
Rust 기반 CLI. 머신리더블 JSON 기본 출력.

## 설치 및 빌드

```bash
git clone https://github.com/junhoyeo/hades
cd hades
cargo build --release
# 바이너리: ./target/release/hades

# 데이터 동기화용 Python 의존성
pip install pykrx pandas pyarrow tqdm
```

## 주요 커맨드

```bash
# 데이터 동기화
hades sync                       # 증분 동기화
hades sync --init 1              # 1년치 초기화
hades sync --init 3              # 3년치 초기화

# 종목 목록
hades list --limit 10

# 종목 정보
hades ticker 005930

# OHLCV 데이터
hades ohlcv 005930 --from 2024-01-01 --to 2024-12-31

# 외국인 수급
hades foreign-flow 005930 --days 30

# 백테스트
hades backtest --market kospi --strategy momentum --top-k 10
```

## 백테스트 옵션

| 옵션 | 값 | 기본값 |
|------|-----|--------|
| --market | kospi, kosdaq, all | all |
| --strategy | momentum, volume_breakout, mean_reversion, low_volatility, random | momentum |
| --top-k | 1-100 | 10 |
| --rotation | weekly, monthly | monthly |
| --filter | conservative, moderate, aggressive | moderate |
| --entry | day1, gapdown | day1 |

## 출력 형식

```bash
--format json    # 기본 (머신리더블)
--format csv     # 스프레드시트용
--format table   # 사람이 읽기 편한 형태
```

## 한국 시장 규칙 (핵심)

- **가격제한폭**: ±30% (2015-06-15 이전: ±15%)
- **증권거래세**: 0.15% 매도 시 (2025년 기준)
- **연간 거래일**: 252일
- **VI 발동**: KOSPI200 ±3%, 기타 ±6% (동적), ±10% (정적)

전체 증권거래세 개정연혁 및 틱사이즈 테이블 → `references/market-rules.md`

## 프로젝트 구조

```
hades/
├── crates/
│   ├── hades-cli/           # CLI 바이너리
│   ├── krx-market/          # 한국 시장 규칙 (266 tests)
│   ├── krx-data/            # 데이터 프로바이더 (253 tests)
│   ├── krx-backtest-core/   # 백테스트 엔진 (494 tests)
│   ├── krx-server/          # REST API (Axum, port 3001)
│   └── krx-viz/             # 시각화 컴포넌트
└── scripts/
    ├── sync_krx_data.py     # OHLCV 다운로더
    └── sync_foreign_flow.py # 외인 수급 동기화
```

## 웹 대시보드

```bash
cargo run -p krx-server    # 백엔드: port 3001
cd frontend && npm run dev # 프론트엔드: port 3000
```

자세한 시장 규칙 및 Rust 라이브러리 사용법 → `references/market-rules.md`
