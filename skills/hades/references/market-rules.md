# 한국 시장 규칙 상세 레퍼런스

## 증권거래세 개정연혁

| 기간 | KOSPI | KOSDAQ | 코넥스 |
|------|-------|--------|--------|
| ~2019 | 0.30% | 0.30% | 0.30% |
| 2019~2020 | 0.30% | 0.30% | 0.15% |
| 2021 | 0.23% | 0.23% | 0.10% |
| 2022 | 0.23% | 0.23% | 0.10% |
| 2023 | 0.20% | 0.20% | 0.10% |
| 2024 | 0.18% | 0.18% | 0.10% |
| 2025~ | 0.15% | 0.15% | 0.10% |

> 매도 시에만 부과 (매수 시 부과 없음)

## 가격제한폭 변경연혁

| 기간 | 제한폭 |
|------|--------|
| ~2015-06-14 | ±15% |
| 2015-06-15~ | ±30% |

## 틱사이즈 테이블

| 가격 범위 | 틱사이즈 |
|----------|---------|
| ₩1,000 미만 | ₩1 |
| ₩5,000 미만 | ₩5 |
| ₩10,000 미만 | ₩10 |
| ₩50,000 미만 | ₩50 |
| ₩100,000 미만 | ₩100 |
| ₩500,000 미만 | ₩500 |
| ₩500,000 이상 | ₩1,000 |

## 변동성 완화장치 (VI)

| 구분 | 발동 기준 |
|------|----------|
| 동적 VI - KOSPI200 | ±3% |
| 동적 VI - 기타 | ±6% |
| 정적 VI | 전일 종가 대비 ±10% |

## 거래 기본 규칙

- **연간 거래일**: 252일 (연율화 기준)
- **거래세**: 매도 시에만 부과
- **결제**: T+2 (매매 후 2거래일 결제)

## Rust 라이브러리 사용법

### 벡터화 백테스트

```rust
use krx_backtest_core::{
    run_vectorized_backtest, VectorizedBacktestConfig,
};

let prices = vec![100.0, 105.0, 103.0, 108.0, 110.0];
let signals = vec![1.0, 1.0, 0.0, 1.0, 1.0]; // 1 = long, 0 = flat

let config = VectorizedBacktestConfig::default();
let result = run_vectorized_backtest(&prices, &signals, config);

println!("Total Return: {:.2}%", result.total_return * 100.0);
println!("Sharpe Ratio: {:.2}", result.sharpe_ratio);
```

### 크로스섹셔널 랭킹 백테스트

```rust
use ndarray::array;
use krx_backtest_core::{
    run_ranking_backtest, CrossSectionalConfig,
};

let prices = array![
    [100.0, 200.0, 150.0],
    [105.0, 195.0, 155.0],
    [110.0, 190.0, 160.0],
];
let rankings = array![
    [1.0, 3.0, 2.0],
    [2.0, 1.0, 3.0],
    [3.0, 2.0, 1.0],
];

let config = CrossSectionalConfig::default();
let result = run_ranking_backtest(&prices, &rankings, 0.34, &config);
println!("Sharpe: {:.2}", result.sharpe_ratio);
```

## CLI 출력 예시

### hades ticker 005930
```json
{
  "symbol": "005930",
  "market": "KOSPI",
  "data_available": true,
  "first_date": "2024-01-02",
  "last_date": "2025-01-31",
  "total_bars": 260,
  "last_close": 53400
}
```

### hades backtest 결과
```json
{
  "config": {
    "market": "kospi",
    "strategy": "momentum",
    "top_k": 10,
    "rotation": "monthly",
    "filter_preset": "moderate",
    "entry": "day1",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "results": {
    "total_return_pct": 25.34,
    "final_value": 125340000,
    "initial_capital": 100000000,
    "num_trades": 120,
    "avg_stocks_passed": 45.5
  }
}
```

### hades foreign-flow 005930
```json
{
  "symbol": "005930",
  "period_days": 30,
  "metrics": {
    "total_net_buy_volume": 45678901,
    "total_net_buy_value": 2500000000000,
    "avg_daily_net_buy_volume": 1522630.0,
    "consecutive_buy_days": 5
  }
}
```

## 크레이트 목록

| 크레이트 | 설명 | 테스트 수 |
|---------|------|---------|
| hades-cli | AI-friendly CLI | - |
| krx-market | 시장 규칙 (틱, 제한폭, VI, 수수료) | 266 |
| krx-data | 데이터 프로바이더, 외인 수급 | 253 |
| krx-backtest-core | 백테스트 엔진, 필터, 앙상블 | 494 |
| krx-server | Axum REST API, WebSocket | 25 |
| tossinvest | TossInvest API 클라이언트 | 16 |
