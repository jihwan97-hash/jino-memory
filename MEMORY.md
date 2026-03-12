# Permanent Memory
<!-- No temporal decay — always 100% relevance -->
<!-- 오너가 교정하거나 새로운 선호를 말할 때마다 여기에 기록 -->

## 캘린더 규칙
- 일정 생성 시 **`astin@hashed.com` 캘린더에 직접 생성** (`GOOGLE_CALENDAR_ID=astin@hashed.com`)
- jihwan 캘린더가 아닌 astin 캘린더에 만들어야 형이 직접 수정 가능
- **메인 캘린더**: astin@hashed.com (조회/생성/확인 모두 이걸로)
- 캘린더 소유자(인증용): jihwan260213@gmail.com
- 타임존: Asia/Seoul
- `--visibility private/public/default` 옵션 지원 (calendar.js에 추가됨)

## 크론 잡
- 7개 크론: auto-study, brain-memory, email-summary, email-summary-evening, portfolio-research, self-reflect, morning-briefing
- 게이트웨이가 자동 실행 — 직접 실행하지 않는다
- brain-memory, email-summary, morning-briefing: OAuth 토큰 간헐적 에러 중 (openclaw setup 재인증 필요)

## Gmail 계정
- work (astin@hashed.com) — 읽기 전용
- personal (gkswlghks118@gmail.com) — 읽기 전용
- jihwan (jihwan260213@gmail.com) — 전체 접근 (send, reply, trash, delete, modify, labels)

## 형 관심사 / 즐겨찾기
- F1 Cosmos 실시간 대시보드: https://f1cosmos.com/ko/dashboard/live
- F1 The Data (데이터 분석): https://f1thedata.com/

## 오너 선호
- 짧고 핵심적인 답변 선호
- 건강 관련은 과학적 근거 기반으로 자세히
- 한국어 기본, 반말 사용
- Telegram 스트리밍: block 모드

## 하드웨어
- M4 맥북으로 이사 완료 (2026-03-05 확인)

## 시스템 설정
- startup-guard 훅 활성화: 게이트웨이 시작 시 streaming=block 자동 복원
- 하트비트 모델: `anthropic/claude-haiku-4-5` (비용 절감, 2026-03-06 적용)
- 지식 파이프라인: 링크 받으면 요약 → 형에게 확인 → 저장 (`warm-memory/knowledge-base/`)
- 지식베이스: short-term/mid-term/long-term 티어, 현재 53개 항목

## 웹 스크래핑 도구
- **Scrapling**: 스텔스 HTTP 스크래퍼. `python3 /Users/astin/.jinobot/clawd/skills/scrapling/scripts/fetch.py "URL"`
- 모드: http (기본) / stealth (봇 우회) / playwright (JS 렌더링)
- 일반 스크래핑은 Scrapling 우선, JS 렌더링 필요 시 playwright 모드 or 기존 cloudflare-browser

## 시스템 이력
- 2026-02-25: memory_search 수정됨 — Gemini 임베딩 모델 `gemini-embedding-001`로 변경
- 2026-03-03: astin@hashed.com 캘린더 기본 생성으로 변경 (형이 직접 수정 가능)
- 2026-03-03: startup-guard 훅 추가 (게이트웨이 재시작 시 설정 자동 복원)
- 2026-03-03: 지식 파이프라인 구축 (knowledge-base 폴더 + SOUL.md 워크플로우)

## 지식베이스 인사이트

### AI / 투자
- **Leopold Aschenbrenner Situational Awareness 펀드**: AGI 인프라(전력·GPU·에너지) 올인 전략으로 12개월 만에 $225M→$5.5B 달성. AI 수혜주 = NVIDIA만이 아님. 전력·냉각·데이터센터 REIT 주목
- **Infosys 숏 논리**: AI 코딩 툴(Cursor, Copilot 등)이 인도 IT 아웃소싱 업계를 구조적으로 위협 → 인도 IT 대형주 리스크 요인
- **AI 수요 구조**: OpenAI 서버 용량 3배 늘릴 때마다 매출도 3배 성장 (2023→2024→2025 반복). 현재 수요가 공급 초과 — 닷컴버블과 다른 구조

### 한국 주식 매크로 시나리오
- **코스피/코스닥 하반기 수혜 가능성**: 미 대법원 트럼프 관세 위헌 판결 + 중간선거 현금살포 기대 + AI 인프라 투자 유동성 → HBM(삼성/하이닉스) 수요로 이어지는 시나리오 주시

### 매크로 / 크립토 규제
- **스테이블코인 = QNB(Quasi Narrow Bank)**: GENIUS 법안은 준비금 재사용(rehypothecation) 금지 → 은행 예금 이탈 + 신용 중개 감소. 준비금 모델 3가지(Narrow Bank / Two-tiered / Security holdings)에 따라 영향 상이. 무이자 시 예금 $1 이탈→대출 $0.19↓, 이자 지급 시 $0.38↓(2배). 소형 은행 취약. HVF 포트폴리오 관련성: Merge Holdings(EU EMI+VASP) 규제 모트 강화 가능, dYdX/Init Capital 스테이블코인 대출 수요 직접 영향, Juno 포지셔닝 주요 변수

### AI 기억/지식 관리
- **AI 기억 시스템 설계**: 해시태그(인덱스)+요약+Bullet 10개+소스 형식으로 저장. 단기→중기→장기 기억 증류. 이미 아는 내용엔 피드백 → 모델이 선호 학습. OpenClaw로 구현 가능

### 포트폴리오 (HVF 투자)
- **Concrete Protocol (A1 XYZ)**: DeFi 온체인 신용 인프라, 청산 보호+수익 집계. TGE 임박 — 토큰 런칭 모니터링 필요
- **Ad-Shield (애드쉴드)**: Adblock Recovery 기술, 30% MoM 성장. Series A 가능성 모니터링 필요
- **Aptos (APT)**: Move 기반 L1, 2026.02 하드 공급 캡 + 바이백 + 스테이킹 보상 축소로 디플레이션 전환. Framework-level CLOB 출시 예정. Sui와 Move L1 양대 축 경쟁 중
- **Atommerce / 마인드카페**: 한국 1위 멘탈헬스 플랫폼. 우울증 DTx 서울대병원 임상 완료, 식약처 허가 진행 중 — 국내 DTx 상용화 선도 사례 될 수 있음. 롯데헬스케어·삼성벤처 전략 투자 유치
- **Backpack (Blue Coral)**: Solana 기반 지갑+거래소. 창업자/VC 직접 토큰 미배분 + 스테이커에 회사 주식 20% 집단 배분이라는 혁신적 토크노믹스 구조. 유니콘 밸류 신규 라운드 추진 중
- **Block Odyssey**: 블록체인 기반 물류·위조방지·자산 토큰화 B2B 기업. 2022 Series A 완료, 최근 2년 공개 뉴스 부재 — 조용한 B2B 운영 추정
- **Borderless (Stockal)**: 신흥시장→미국주식 크로스보더 투자 플랫폼. 런웨이 4개월 [주의], 브리지 라운드로 임시 운영 중. Series A 또는 후속 펀딩 모니터링 필수
- **CodeStates (코드스테이츠)**: 한국 최초 코딩 부트캠프에서 B2B 기업 디지털 전환 교육으로 피벗. 개발·AI·데이터·업무자동화 분야 기업교육 솔루션. 누적 펀딩 40억원. DT 수요 확대에 올라탄 성공적 피벗 사례
- **Comento (코멘토)**: 현직자 멘토링 + 라이브 실무 교육 커리어 플랫폼. 녹화 아닌 라이브 교육 방식 차별화. 2025 고용노동부 로컬 AI 메이커스랩 수주 — B2G 확장 성공. 누적 펀딩 47억원
- **Community Gaming**: 자동화 이스포츠 토너먼트 플랫폼 (communitygaming.io). ⚠️ 런웨이 1개월 긴급 — 즉각 브리지 파이낸싱 또는 엑싯 협상 필요. 제품 자체는 가동 중. MOBA 게임 이스포츠 수익 비중 28.7% (2026)
- **Contextsio / Aimo**: AI 에이전트 플랫폼으로 분류된 HVF 포트폴리오 기업. 공개 정보 거의 없음 — 스텔스 모드·피벗·리브랜딩 가능성. 내부 확인 필요
- **CryptoQuant (팀블랙버드)**: 블록체인 온체인 분석 플랫폼. 비트코인 사이클 저점 2026년 6-12월 예측 발표. 트레이더·기관 대상. 경쟁사: Glassnode, Nansen, Dune Analytics (일부 동일 HVF 포트폴리오)
- **Delivus (딜리버스)**: AI 물류 최적화(K-means 클러스터링) 기반 당일 배송 DaaS 기업, 브랜드 딜리래빗. ⚠️ 런웨이 2개월 긴급 — 물류 대기업 M&A(CJ/롯데) 또는 AI SaaS 피벗, 자산 매각이 현실적 옵션
- **Dfns**: 기관급 디지털 자산 커스터디 API 플랫폼. 2025 IBM과 IBM Digital Asset Haven 공동 구축, Q2 2026 온프레미스 배포 예정. Canton Network 통합으로 분산형 상호운용 커스터디 실현. Series A 6M 조달
- **DG Ventures**: 탈중앙화 기술 전문 VC (Fund of Funds). ⚠️ 런웨이 3개월 긴급 — RWA 토큰화(2025 66% 성장, 25B) 및 DeAI 트렌드에 부합하는 포트폴리오 보유, 즉각 자본 확충 필요
- **Doeat (두잇)**: 한국 최초 무료 배달 앱, 관악구 중심 5개구 운영. Goodwater 주도 306억원 Series A (Hashed·SBVA 참여). 수수료 도입 여부가 수익화 핵심 변수 — 배달의민족·쿠팡이츠 대안 포지션
- **Dolores Park Labs / Ferum**: Aptos 기반 온체인 CLOB(Central Limit Order Book) DeFi 인프라. Move 언어 기반, AMM 방식 대체하는 기관급 오더북 제공. 유동성 공급자에게 전례 없는 통제권 부여. Aptos 생태계 성장과 연동
- **DrNow (닥터나우)**: 한국 비대면 진료 1위 앱, DAU 기준 560만 사용자. Series B 4000억원(~300M USD) 목표 진행 중. 원격 상담·처방·약품 배달 통합 + 위고비·마운자로 체중관리 주사 서비스 포함. IPO 로드맵 모니터링
- **Dune Analytics**: 100개+ 블록체인 SQL 기반 온체인 데이터 분석 산업 표준 플랫폼. 2026.02 스테이블코인 통합 데이터셋(EVM·Solana·Tron) 출시. 무료+기업API 구조. HVF 최우선 포트폴리오
- **dYdX Trading**: 탈중앙화 무기한선물(Perps) 거래 프로토콜. 2026년 RWA 합성 주식(테슬라 등) 선물 시장 출시 계획. 21Shares 파트너십 기반 기관 채널 확대. HVF 최우선 — 토큰($DYDX) 엑싯 전략 모니터링 핵심
- **Fitogether (핏투게더)**: KineticSense™(RTK-GNSS+IMU) 선수 추적 시스템. FIFA 공인 GNSS 선수 추적 유일 공급사 3년 연속, 정확도 최고점 기록. FIFA 인증이라는 강력한 진입장벽 보유. FIFA 파트너십 2026.10까지 갱신 완료
- **Flexity (플렉시티) / Edit Collective**: AI 자동 건축 기획설계 SaaS. 토지 입력 시 실시간 건축법규 분석 + 3D 설계안 + 사업성 검토 즉시 제공. Hashed Series A 투자. B2B(건설사)+B2C(개인투자자) 구독 모델
- **Fusion Point Studios**: FPS 게임 Shoot City 개발사. ⚠️ 런웨이 1개월 존폐 위기 — 공개 정보 전무(스텔스/명칭 혼용). 선택지: Early Access 런칭 / 퍼블리셔 딜 / 팀 인수합병. 즉각 회사 정체성 확인 및 제품 출시 가능 여부 평가 필요
- **Gowid (고위드)**: 실시간 데이터 기반 고성장 기업 대상 법인카드 + 기업금융 B2B FinTech. 2026.02 네이버페이 모바일 결제 연동 발표. 2025 매출 79억원(직원 63명), 2015년 설립, CEO 김항기. HVF 최우선 포트폴리오, IPO 목표
- **GreenLabs (그린랩스)**: 팜모닝 플랫폼 기반 한국 애그테크 선도 기업. 생산~유통 데이터 기반 영농 관리, 글로벌 1위 비전으로 잠재 대상 14억 농부. 데이터 네트워크 효과(농부 증가 → 데이터 품질 향상) + 풀스택 접근으로 농업 디지털화 선도
- **Halliday International**: AI 에이전트 ↔ Web3 스마트 컨트랙트 신뢰성 연결 Workflow Protocol 제공. a16z crypto 주도 Series A 10M — "에이전트 인터넷의 핵심 인프라" 논거. Web3 게임 온보딩에서 AI 에이전트 인프라로 성공 피벗. Series B 및 채택 지표 모니터링
- **Hyperithm**: 도쿄+서울 듀얼 HQ 기관급 디지털 자산 운용사. HFT/알고 마켓뉴트럴 + 기관 브로커리지(상장사·패밀리오피스·크립토 거래소) + 벤처투자(L1/L2·인프라·dApps·게임) 3개 수익원. 창업자 Forbes 30 Under 30·모건스탠리 출신. 일본·한국 시장 진입 게이트웨이 강점
- **Init Capital / INFINIT**: DeFi 유동성 분산 문제 해결 Liquidity Hooks + 에이전틱 DeFi 추상화 플랫폼. Electric Capital·Hashed·Maelstrom(Arthur Hayes)·Lightspeed 등 10M 조달. 2026.01 IN 토큰 거래 시작, 35.73M 언락. 유동성 레이어 인프라 경쟁 심화 주시
- **JEJEMEME (제제미미)**: 쑥쑥찰칵 앱 — 한국 1위 아이 성장기록 플랫폼. Hashed·Spring Camp·하나벤처스 Series A 20억원. 2024.12 일본 진출, 현지 인플루언서 130명 앰배서더 협업. "출산율 세계 꼴찌→글로벌 1위 육아 서비스" 비전. AI 육아 서비스 강화 방향
- **Juno / Nuo Capital**: 크립토 네이티브 네오뱅크 (싱가포르). 미 국채 자동투자 현금관리 + 20개+ 블록체인 크립토 계정. ParaFi Capital 주도 Series A 18M (Hashed+Jump Crypto 참여). 업계 최초 토큰화 로열티 프로그램. 최근 업데이트 없음 — 현 트랙션 확인 필요
- **Kite AI (구 Zettablock)**: Zettablock(블록체인 데이터)→Kite(AI 에이전트 인프라)로 리브랜딩. Kite AIR: AI 에이전트 독립 신원인증·결제 인프라. PayPal Ventures+General Catalyst 공동 주도 Series A 18M. Coinbase·PayPal On/Off-Ramp API 연동. "최초의 AI 결제 블록체인" 포지셔닝
- **LOVO**: 100개 언어 500개+ 음성 AI 보이스 생성 + TTS + 동영상 에디터 통합 플랫폼. 콘텐츠 크리에이터·소규모 프로젝트 타겟. 경쟁사: ElevenLabs, Murf.ai, Speechify. 가격 티어 간격 과다 피드백. 최근 펀딩 뉴스 없음 — Series A/B 현황 파악 필요
