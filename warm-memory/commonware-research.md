# Commonware 리서치 보고서

> 작성일: 2026-02-27  
> 목적: 일반 리서치 (블록체인 인프라 프로젝트)

---

## 1. 프로젝트 개요 및 목적

**Commonware**는 2024년에 설립된 오픈소스 Rust 기반 블록체인 프레임워크 프로젝트다.

- **핵심 목표**: 개발자가 맞춤형 고성능 블록체인을 빠르게 구축할 수 있도록 모듈형 프리미티브(primitive) 제공
- **비전**: 기존 블록체인의 레이어(합의, 네트워크, 스토리지 등)를 디커플링하여 **과도한 처리량(excessive throughput)**, **유연한 수정성(tractable modification)**, **내장형 상호운용성(embedded interoperability)** 달성
- **철학**: "더 많은 체인이 서로 연결될수록 전체 생태계가 강해진다"는 관점에서 신뢰 가정 없는 체인 간 상호운용성을 목표로 함

---

## 2. 핵심 기술/아키텍처

### 기술 스택
- **언어**: Rust (성능 최우선)
- **구조**: 모듈형 프리미티브 라이브러리 집합 (현재 17개 프리미티브, 50개 이상 변형 dialect)
- **테스트 커버리지**: 93%, 일일 벤치마크 1,500회

### 주요 프리미티브 (Primitives)

| 프리미티브 | 기능 |
|---|---|
| `consensus` | Byzantine 환경에서 메시지 순서 정렬 |
| `cryptography` | 키 생성, 서명, 검증 |
| `p2p` | 암호화 연결로 인증된 피어 간 통신 |
| `storage` | 추상 스토어에서 데이터 영속화/조회 |
| `broadcast` | 광역 네트워크에서 데이터 전파 |
| `runtime` | 설정 가능한 스케줄러로 비동기 태스크 실행 |
| `coding` | 데이터 인코딩으로 부분 프래그먼트로부터 복구 |
| `stream` | 임의 트랜스포트를 통한 메시지 교환 |
| `deployer` | 클라우드 프로바이더에 인프라 배포 |

### 주요 기술적 혁신

1. **Minimmit 합의 프로토콜**: 1라운드 투표로 빠른 최종성 달성 (~100-200ms). 단, 비잔틴 내성은 ~20% 이하 (일반 33%보다 낮음)
2. **Buffered Signatures**: 블록 타임 20% 감소 (~200ms), 블록 최종성 20% 감소 (~300ms), CPU 사용량 65% 감소
3. **QMDB (Quick Merkle Database)**: LayerZero의 QMDB 기반 append-only 인증 데이터베이스 패밀리 개발. LayerZero와 협업하여 프로덕션화 진행 중
4. **Erasure Coding 기반 블록 전파**: 리더가 전체 블록을 각 검증자에게 전송하는 대신, 유휴 검증자의 대역폭을 활용해 병렬 전파

### 레퍼런스 구현체
- **Alto**: Commonware 라이브러리로 구축한 최소화(wicked fast) 블록체인. 지속적 벤치마킹용
- **Battleware**: VRF, Timelock Encryption, MMR을 활용한 온체인 배틀 게임

---

## 3. 팀 및 투자자

### 창업자

| 이름 | 역할 | 배경 |
|---|---|---|
| **Patrick O'Grady** | Founder / CEO | Stanford CS → Coinbase (Rosetta 개발 주도) → Ava Labs VP of Engineering (3.5년) → Commonware 창업 |

- 팀 규모: 직원 7명 (창업자 포함, 2025년 11월 기준)
- 고객: 4개사 (각 평균 $1M 이상 연간 매출)

### 투자자

**시드 라운드 (2024년 12월, $9M)**
- Haun Ventures (리드)
- Dragonfly Capital
- Zaki Manian (Osmosis 공동창업자, 앤젤)
- Sreeram Kannan (EigenLayer 창업자, 앤젤)
- Dan Romero (Farcaster 창업자, 앤젤)
- Mert Mumtaz (Helius CEO, 앤젤)
- Smokey The Bera (앤젤)

**전략적 투자 (2025년 11월, $25M)**
- **Tempo** (리드) - Stripe + Paradigm이 공동 출범한 결제 특화 블록체인
- 누적 조달: **$34M**
- 시드 라운드 밸류에이션: $63M (Pitchbook 보고)
- 시리즈 A 후 "유의미한 상승" (미공개)

---

## 4. 토큰/비즈니스 모델

### 비즈니스 모델
- **토큰 없음** (현재 기준): 토큰 발행 계획 미확인, 오픈소스 프레임워크 판매
- **수익 구조**:
  1. **배포 지원(Deployment Support)**: 고객사가 Commonware 기반 체인을 배포하는 것을 돕는 서비스
  2. **오픈소스 인터페이싱 지원**: 오픈소스 소프트웨어와의 연동 지원
- **현황**: 이미 흑자(profitable) 달성. 고객 1개사 평균 연간 $1M+ 매출
- **대기자 목록**: 고객 수요가 공급보다 많은 상태 (backlog 보유)

---

## 5. 경쟁사 대비 차별점

### 주요 경쟁 프레임워크

| 항목 | Commonware | Cosmos SDK | Substrate (Polkadot) |
|---|---|---|---|
| 언어 | Rust | Go | Rust |
| 철학 | 초경량 프리미티브 조합 | 모듈형 앱체인 | FRAME 팔렛 조합 |
| 합의 유연성 | 완전 교체 가능 | Tendermint 기반 | 선택 가능 |
| 상호운용성 | 내장형 (신뢰 가정 최소화) | IBC | XCM (공유 보안) |
| 타깃 | 최고 성능 앱체인 | 빠른 앱체인 출시 | 커스텀 런타임 로직 |

### Commonware의 핵심 차별점

1. **Primitive-first 설계**: 전체 스택 패키지가 아닌 필요한 컴포넌트만 조합. 오버엔지니어링 최소화
2. **성능 최우선**: ~200ms 블록 타임, ~300ms 최종성. Rust로 저레벨 최적화
3. **최소 팀, 최대 성과**: 직원 7명으로 $34M 조달 및 흑자 달성. 린(lean) 운영 증명
4. **Tempo/Stripe 파트너십**: 전통 금융(Stripe)과 크립토(Paradigm)를 잇는 레퍼런스 고객 확보
5. **LayerZero QMDB 협업**: 상태 증명 기술의 실용화

---

## 6. 최근 동향/뉴스

### 2025년 11월
- **$25M 전략적 투자 유치**: Tempo(Stripe+Paradigm 합작)가 리드. Tempo가 고속 결제 처리를 위해 Commonware 라이브러리 채택
- **Fortune 인터뷰**: Patrick O'Grady, 흑자 달성 및 고객 backlog 확인

### 2025년
- **Tempo 파트너십 공개**: Tempo가 Commonware 라이브러리로 결제 블록체인 구축 발표
- **LayerZero QMDB 협업**: QMDB 브랜드 채택 및 프로덕션화 협업 발표
- **Buffered Signatures 출시**: 블록 타임 20%, 최종성 20%, CPU 65% 개선

### 2024년 12월
- **$9M 시드 라운드**: Haun Ventures, Dragonfly Capital 등 참여
- **Commonware 라이브러리 공개**: 오픈소스 발표

---

## 7. 총평

Commonware는 **"적을수록 좋다(less is more)"** 철학을 블록체인 인프라에 적용한 프로젝트다. 풀스택 블록체인 플랫폼이 아닌, 검증된 Rust 프리미티브를 조합해 개발자가 원하는 체인을 빠르게 구축할 수 있게 한다.

특히 주목할 점:
- **Tempo(Stripe+Paradigm) 도입**: 대형 전통 금융의 블록체인 인프라로 채택
- **7명 팀 흑자 운영**: 블록체인 스타트업에서 매우 이례적
- **Patrick O'Grady 이력**: Avalanche VP 출신으로 실전 검증된 블록체인 엔지니어링 역량

잠재적 리스크로는 소규모 팀으로 인한 확장성 한계, 토큰 모델 부재로 인한 커뮤니티 인센티브 부족, 그리고 합의 프로토콜(Minimmit)의 ~20% 비잔틴 내성 한계 등이 있다.

---

*Source: commonware.xyz, Fortune, CoinCarp, Crunchbase, Brave Search (2026-02-27)*
