# MEMORY.md — Jino Long-Term Memory

_지노의 장기 기억. 중요한 컨텍스트, 결정, 인사이트를 담는다._

---

## astinclaw.pw 블로그 배포

- **경로**: `/Users/astin/Projects/astinclaw-web`
- **배포**: Vercel — `vercel deploy --prod` 로 배포 (`.vercel/project.json` 연결됨)
- **도메인**: `https://astinclaw.pw`
- **구조**: 폴더 기반 정적 HTML (`blog/slug/index.html`)
- **블로그 목록**: `blog/index.html` 의 `posts` 배열에 추가
- **Git remote 없음** — 커밋 후 vercel CLI로 직접 배포

## 지식베이스 인사이트

### 포트폴리오 기업 (Hashed)
- **Merge Holdings**: EU EMI 라이선스 + AMF VASP 이중 취득 — 법정화폐+스테이블코인 이중 결제 레일 합법 운영 가능, EU에서 Ripple 대비 선점 포지션
- **Mythical Inc.**: Mythical Platform + Mythos Chain 기반 블록체인 게임 인프라 — MYTH 토큰, 게임 내 자산 실소유권 제공
- **Nurihaus(누리하우스)**: 인플루언서 기반 커뮤니티 커머스 → K브랜드 해외 진출 지원. 최우선 모니터링 대상
- **Overworld**: Hashed 주도 시드 $10M 크로스플랫폼 멀티플레이어 ARPG, 2024~개발 중
- **Payhere(페이히어)**: 가맹점 82,000개 이상 한국 1위 누적 판매 클라우드 POS. 최우선 모니터링 대상
- **Phi Labs/Archway**: Cosmos Layer 1, Developer Rewards Protocol — dApp 개발자가 거래 수수료 + 인플레이션 보상 직접 수취
- **PortOne(구 Chai)**: 아시아 통합 결제 API. 다운라운드 이슈 + Terraform 창업자 연관 리스크 모니터링 필요
- **RadiusXYZ**: Ethereum 롤업용 탈중앙화 공유 시퀀서 — PVDE 기술로 MEV·검열·프런트러닝 방지
- **Ramper**: Web3 온보딩 마찰 제거 B2B 지갑 SDK + NFT 체크아웃 인프라
- **Republic (Opendeal)**: 크라우드펀딩 + 기관 프라이빗 캐피탈 + RWA 토큰화 복합 투자 플랫폼
- **Sejinsa(세진사)**: 구독형 출장 세차 — 아파트/오피스 주차장, 시니어 일자리 결합 모델
- **Seoul Exchange(서울거래)**: 금융위 혁신금융 지정 비상장 증권 거래소 + Story Protocol과 3년 독점 RWA 토큰화 계약
- **Story Protocol / Pen Technology**: 프로그래머블 IP Layer 1, 2025년 TGE + $80M Series B(a16z) 완료, AI 학습 데이터 IP Vault 추진. 최우선
- **Taiko Labs**: 이더리움 based rollup — 무허가 시퀀싱/증명 최초 달성
- **TheSwing(더스윙)**: 한국 유일 3년 연속 흑자 공유 킥보드, 2027년 Q4 IPO 목표, 매출 584억원. 최우선
- **Trek Labs/Backpack Exchange**: Solana 기반 크립토 거래소, $1B+ 프리머니 밸류 추진, 창업자/VC 토큰 미배분 혁신 토크노믹스
- **Uprise/HorizonWealth(업라이즈)**: 헤이비트 운영사 → 두물머리투자자문 합병, HorizonWealth로 2025년 퇴직연금 수탁고 1조원 목표
- **Yuga Labs**: BAYC·CryptoPunks IP 보유, 2025.11 Otherside 메타버스 런칭 + Amazon Gaming 파트너십

### 지정학 & 매크로
- **이란-호르무즈 리스크**: 호르무즈 봉쇄 시 글로벌 원유 공급 최대 -17M BPD, 유가 $180~250+ Tail Risk. 삼성/SK하이닉스 원가 +5~8%, 카타르 헬륨 차단 시 팹 공정 차질. TSMC 상대 유리. 탱커주(Frontline 등)·TIPS·금 헤지 전략 유효

### Claude Code 소스 분석 인사이트 (2026-04-01)
- **Tool result 크기 관리**: 50K/개, 병렬 합산 200K 초과 시 디스크 오프로드. 병렬 파일 읽기 시 청크 처리 필요
- **Prompt caching 순서**: 불변 → 반불변 → 가변 순서로 배치. cache read 비용은 일반 input의 10%. 실측 99.93% hit rate
- **Latched state 패턴**: 상태 토글 최소화로 cache break 방지. 한 번 ON → 세션 내내 ON 유지
- **결정론적 Hook 원칙**: 비가역 액션은 LLM 프롬프트 대신 명시적 확인으로 제어. "조심해" 프롬프트 < 하드 차단
- **출처**: <https://github.com/nathanyjleeprojects/learn-from-claudecode>

### HVL 오프사이트 인사이트 (2026-03-04)
- **AI 협업 패러다임 전환**: "분업 후 합치기" → 각자 풀스택 후 커밋 히스토리를 컨텍스트로 공유. PR 충돌 해결보다 재개발이 빠른 사례 급증
- **권한 위임 기준**: AI에게 위임할 수 있는 범위는 reversibility(가역성)가 기준 — 비가역적 결과에는 권한 부여 안 함
- **오라클 에이전트 패턴**: 여러 에이전트 독립 검증 → 투표 합의로 단일 LLM 편향 상쇄
- **Git Worktree**: 에이전틱 시대 형상관리 베스트 프랙티스 — 에이전트들이 병렬로 다른 브랜치 작업
- **HVL 평가 결과**: 287팀 중 1인팀 56.4%, 실매출 있는 이커머스 최고점. "3개월 내 대체될 팀은 탈락" 기준. Elyn.ai(MRR 1.5억, 2006년생) 확정 투자
- **툴 콜링 미들웨어**: 네이티브 툴 콜링 우회 → 모델별 텍스트 기반 최적화(Claude=XML, GPT=JSON)로 Berkeley 벤치마크 70→95점(+35%)
- **하네스 철학**: "LLM = 개인 지능, 하네스 = 조직 구조" — 같은 모델도 하네스에 따라 9할의 성능 차이 발생. 에이전트 2.5세대: 선택지 추상화로 서치 스페이스 축소
- **AI 이미지 생성 실무**: Style Reference(색감/분위기) vs Image Prompt(구도/구성) 구분 필수. Replicate API 파이프라인: Upscaling → 프레임 분리 → 배경 제거 → WebM 변환
- **김서준 비전**: "미국/중국 제외 Rest of World가 한국 AI-native 팀의 핵심 기회". 새 유니콘은 블록체인처럼 며칠 만에 글로벌 확산
- **Unlearning(언러닝)**: 기존 지식을 내려놓는 것이 새 학습보다 중요. AI 시대에는 10년+ 도메인 전문가 or 완전 신규 진입자가 강함 — 3~5년 중간 지대가 오히려 약한 포지션

### 운영 이슈 & 시스템 메모 (2026-04-04)
- **jino-memory git push 실패**: `! [rejected] main -> main (fetch first)` — 리모트에 로컬보다 앞선 커밋 존재. 다음 작업 전 `git pull --rebase` 필요 (`/Users/astin/.jinobot/clawd/jino-memory`)
- **KB dedup 로직 정상 작동**: observer가 동일 태스크 후보 중복 감지 후 skip 처리 — 노이즈 필터링 파이프라인 유효
