# RLWRLD (리얼월드) — Internal Review
_Source: Feb 2026 BoD deck, BoD meeting notes, 20+ academic papers, public disclosures_
_Saved: 2026-03-09_

## 기본 정보
- 설립: 2024년, US holdco
- 제품: RLDX — 로보틱스 파운데이션 모델 (5-finger dexterous manipulation 특화)
- 펀딩: Seed 1+2 합계 $41M (한국 스타트업 역사상 최대 시드)
- 현재 라운드: Series A $100M @ $1B pre-money valuation

## 기술 평가
- **강점**: Physical AI 스타트업 중 유일하게 5-finger dexterity 풀스택을 연구 기반으로 보유
- **학술 성과**: CVPR 2026 ×4, ICLR 2026 ×1, NeurIPS/ICCV 2025 ×4+ — 예외적 수준
- **약점**: 통합 RLDX 시스템의 SOTA 대비 벤치마크 미공개
- **핵심 Gap**: RL self-improvement 및 데이터 스케일에서 Pi0, GR00T 대비 격차 존재
- **🔑 핵심 증거**: 4월 Technical Report — 가장 중요한 증명 포인트

## 커머셜 평가
- **강점**: 순수 Physical AI 스타트업 중 가장 강력한 커머셜 파이프라인
- **유료 엔터프라이즈 고객 11+**: BMW, KDDI, Honda, Lotte, ANA, Fuji, Kyocera, SK 등
- **경쟁사 대비**: Pi ($2.4B, 공개 고객 없음) / Figure AI ($2.6B, BMW 실망) / Skild ($1.5B, 배포 사례 없음) 모두 상회
- **약점**: PoC → 반복 계약 전환 사례 아직 없음

## $1B 라운드 평가
- **달성 가능**: 4~5월 마일스톤 달성 시
- **3가지 필수 조건**:
  1. Technical Report: RLDX v1.4가 LIBERO/RoboCasa 기준 SOTA 이상
  2. BMW PoC 성공 + 최소 1개 연간 계약 전환
  3. G0 오픈소스 릴리즈 + 커뮤니티 트랙션
- **미달 시**: $500~700M이 더 방어 가능한 밸류에이션

---

## 1. 기술 상세 평가

### 1.1 RLDX 아키텍처

| 버전 | 파라미터 | 주요 변경 | 속도 |
|------|---------|-----------|------|
| v1.3.0 | 6.86B | QWEN 3.0 VL backbone + MMDiT action head, ~200 VL tokens, cross-attention | 17.6 Hz (TRT) |
| v1.3.1 | 6.86B | MetaQueries 도입 — VL feature를 8토큰으로 압축 (CompACT 논문 기반), joint self-attention | 30.3 Hz (TRT) |
| v1.4.0 | 8.03B | Video encoder + Memory Module (HAMLET 기반) + World Modeling (future DINO feature prediction) 추가. 2026년 3월 기준 학습 중 | 15.5 Hz |
| v1.5 | - | force/tactile sensing, 독립 arm(7+ DoF) + hand(15+ DoF) action head, tactile decoder — 미구현 | - |

### 1.2 벤치마크 현황 (v1.3.0 기준, v1.4는 공개 수치 없음)

| 벤치마크 | RLDX v1.3.0 | GR00T N1.5 | 비고 |
|---------|------------|-----------|------|
| LIBERO (standard) | 95.9% | 95.7% | ≈ 동등 |
| LIBERO Long-horizon | 43.2% | 53.8% | **-10.6p 열세** |
| RoboCasa Kitchen avg | 62.7% | 64.1% | 소폭 열세 |
| Simpler-WidowX | 44.5% (Q99 norm 후) | 62% 재현 불가 (실제 29.2%) | 비교 모호 |

- Cosmos Policy: LIBERO 98.5% / HAMLET atop GR00T: 97.7% → **개별 연구 컴포넌트 > 통합 RLDX** — 통합이 병목
- ⚠️ Q99 normalization 이슈: min-max → percentile 변환만으로 Simpler-WidowX 성능 3배 향상 → 학습 파이프라인 미성숙 시사

### 1.3 차별화된 연구 풀스택 (5-finger dexterity 전용)

| 논문/기술 | 역할 |
|-----------|------|
| Affostruction | Scene understanding — 부분 뷰에서 3D affordance |
| DWM | World modeling — video diffusion 기반 손 상호작용 시뮬레이션 |
| CompACT | Fast planning — 8토큰 latent world model, 40x 속도 향상 |
| DextER | Grasp generation — "어떤 손가락 링크가 어디 접촉하는지" autoregressive reasoning |
| HAMLET | Temporal memory — 경량 메모리 모듈, 히스토리 의존 태스크 +47.2% |
| RS-CL | Representation alignment — proprioceptive state contrastive loss |
| RoboCurate | Data pipeline — simulator-replay 기반 합성 데이터 검증 |
| Robot-R1 | RL improvement — DeepSeek-R1 스타일 RL for embodied reasoning |

- **Pi0, GR00T는 그리퍼 중심** — 5-finger 접촉 추론, dexterous world model, 산업용 dexterity 벤치마크 논문 없음
- **DextER**: 그립 생성 전 "어떤 손가락 관절이 어떤 오브젝트 표면에 접촉할지" 예측 — 문헌상 유사 접근 없음
- **DexBench**: 18개 산업 영감 태스크 (볼트 체결, 케이블 감기, 천 접기, 정밀 삽입 등). 리더보드 커뮤니티 표준화 시 ImageNet급 내러티브 장악 가능

### 1.4 솔직한 약점

1. **통합 벤치마크 없음**: 개별 논문은 SOTA (HAMLET: LIBERO 97.7%, CompACT: 40x 속도, DextER: 67% 그립 성공). 그러나 각기 다른 백본(GR00T N1.5, DINOv3, Qwen 0.5B)에서 테스트 — 통합 RLDX 8B에서 함께 잘 동작하는지 미증명
2. **RL self-improvement 파이프라인 없음**: Pi*0.6 RECAP은 자율 시행착오로 인간 시연자 초월을 증명. RLWRLD는 Robot-R1 논문 있지만 RLDX 통합 계획 미공개 — **가장 큰 전략적 갭**
3. **데이터 스케일 10~100x 열세**: RLDX ~30K real + 148K neural + 197K sim (GR-1/ALLEX만). Pi0: 10,000+ 시간 멀티로봇. GR00T: 수천 시간 다양한 로봇. BoD 데이터: neural+sim 혼합이 "아직 추가 이득 없음" — 합성 스케일링 테제에 옐로우 플래그
4. **8B 모델 속도 패널티**: v1.4는 15.5 Hz (TRT, RTX 5090). GR00T N1.6 (3B)는 27~32 Hz. 실시간 정밀 조작에서 레이턴시 불리. 3B 디스틸레이션 계획 포기
5. **웹 데이터 공동학습 없음**: Pi0.5의 핵심 인사이트는 인터넷 규모 멀티모달 공동학습이 일반화를 극적으로 개선한다는 것. RLWRLD는 QWEN 3.0 VL 백본 사용(웹 사전학습)이지만 VLA 학습 시 공동학습 없음 → 오픈월드 일반화 제한 가능성
6. **크로스 임바디먼트 미검증**: GR-1·ALLEX만. Pi0는 10+ 로봇 타입. GR00T N1.6는 바이매뉴얼 암·휴머노이드·모바일 매니퓰레이터를 단일 모델로 지원

---

## 2. 커머셜 트랙션 상세

### 2.1 파이프라인 개요

**Top 3 핵심 계정**

| 고객 | 현황 | 포인트 |
|------|------|--------|
| **BMW** | 전동 스크류드라이버 볼트 체결 유료 PoC (2025.11~2026.03) | Figure AI 실패 후 직접 접촉. 성공 시 킬러 내러티브 |
| **KDDI/LAWSON** | Seed-1 투자자. 2번째 프로젝트 진행 중(데이터 수집), 3번째 2026 LAWSON 편의점 현장 파일럿 목표 | 이전에 Google DeepMind PnP 시도했으나 미달 |
| **롯데그룹** | 1차 RX 완료. 1년+ 추가 RX + Data+PoC 구두 확약. 그룹 오너 7개 계열사 휴머노이드 카운슬 주도 | FY2026~2030 호텔 확장 로드맵 존재 |

**8개 추가 핵심 계정**

| 고객 | 현황 |
|------|------|
| Honda | Phase 1 PoC 진행 중, Phase 2 4월 계획. ALLEX·Unitree G1·RB-Y1 등 3+ 임바디먼트 테스트 |
| ANA (일본 1위 항공) | 4개 부서 10+ 미팅. JPY 10M + JPY 5M 제안 최종 검토 중 |
| 후지(Fuji, SMT 장비) | JPY 220M (~$1.5M) 1개월 RX + 2개월 Mini PoC CEO 승인. 팍스콘 자동화 요구에 기인 |
| 교세라(Kyocera) | RX 완료. 2년 Data+PoC 논의 중. 자체 VLA(Pi0) 시도 실패 |
| 미쓰이화학 | 3개월 타당성 검토 제안 검토 중 |
| SK그룹 | SUPEX와 공동 로보틱스 전략 개발. 그룹 오너 SK하이닉스 휴머노이드 대체 이니셔티브 |
| 이마트 | 계산원·진열 자동화 RX/PoC 논의 |
| BGF(국내 최대 편의점) | 편의점·물류·식품 RX/PoC 논의 |

**정부 포트폴리오**
- ARPA-H 수술 보조 (Phase 1 선정)
- 호텔 휴머노이드 (선정, 진행 중)
- GPU 배정: H200 ×256 or B200 ×128 (선정)
- LG·삼성SDS·NC AI와 한국 World Foundation Model (검토 대기 중)

### 2.2 미국 경쟁사 대비 비교

| 회사 | 밸류에이션 | 커머셜 현황 |
|------|-----------|------------|
| Physical Intelligence (Pi) | $2.4B | 공개 유료 고객 없음. 순수 리서치 데모 |
| Figure AI | ~$2.6B | BMW 파트너십 있으나 미달 보고. 생산 배포 없음 |
| Skild AI | $1.5B | 공개 고객·배포 없음 |
| Covariant (~$625M, Amazon 인수) | - | Amazon 창고 배포. 유일하게 검증된 매출 — 그러나 좁은 스코프 |
| **RLWRLD** | $1B 목표 | 자동차·통신·호텔·항공·전자·화학·유통·헬스케어에 걸쳐 유료 PoC 11+ 계정. Fuji 단독 ~$1.5M |

- **순수 Physical AI 스타트업 중 가장 광범위한 커머셜 파이프라인**
- **실제 약점**: PoC → 반복 계약 전환 사례 0건. 전부 프로젝트 기반(RX, Mini PoC, Data+PoC). US VC 서사는 "2026년 생산 전환 중"이어야 하는데 "아직 PoC 단계"가 현실

### 2.3 Figure AI 앵글 (투자자용 내러티브)

두 가지 데이터 포인트가 핵심:
1. BMW가 Figure AI에 "내부적으로 실망"하고 RLWRLD에 직접 연락
2. 교세라가 Pi0으로 내부 VLA 시도했으나 "실패"

→ BMW PoC 3월 성공 시 Series A 피치 완성: *"$2.6B, $2.4B 경쟁사를 먼저 시도했던 기업들이 우리에게 왔고, 우리가 산업 정밀 조작에서 해냈다"*

---

## 3. $1B 달성 마일스톤 체크리스트

### 기술 (2026년 4~5월)

**Must:**
- RLDX v1.4 Technical Report: LIBERO ≥98% + RoboCasa Kitchen SOTA. 미달 시 "컴포넌트 SOTA, 통합 모델은 평범" 서사는 치명적
- DexBench 공개 릴리즈 + ALLEX 기준 RLDX S0 결과. dexterity 카테고리 정의
- G0 비상업 오픈소스 릴리즈. Pi0·GR00T 모두 오픈소스 — 클로즈드 모델은 이 단계에서 약해 보임

**Strong signal:**
- 비 ALLEX 계열 dexterous hand에서 크로스 임바디먼트 데모 (하드웨어 종속 아님을 증명)
- 任意 RLDX 태스크에서 RL self-improvement 초기 결과 (Pi*0.6 RECAP 격차 해소)

### 커머셜 (Series A 클로징까지)

**Must:**
- BMW PoC 성공 완료 → 연간 계약 논의 개시
- 최소 1개 계정 PoC → 연간/멀티이어 계약 전환 (Fuji JPY 220M이 가장 근접)
- US President 채용 완료 + SF 오피스 실제 BD 활동 시작

**Strong signal:**
- $1~2M ARR (또는 연환산 PoC 매출). 프로젝트 기반이라도 "매출 있는 딥테크"로 리프레임
- US 엔터프라이즈 계정 (현재 파이프라인은 전부 일본/한국)

### 전략

**Must:**
- GTC 및/또는 Montgomery Summit 데모로 US 투자자 파이프라인 생성

**Strong signal:**
- 정부 GPU 배정(H200 ×256) 공식 실행 (주권 AI 지원 증명)
- 전략적 투자자 확정 (BoD에서 "최종 검토 중" 언급)
- Nebius Robotics Award 수상 (이미 달성 — 내러티브용)

### 밸류에이션 시나리오

| 시나리오 | 조건 | 밸류 |
|---------|------|------|
| 강세 | Tech Report SOTA + BMW 연간 계약 + Fuji 실행 + DexBench 커뮤니티 채택 + G0 오픈소스 트랙션 | **$1B+** |
| 중립 | Tech Report 점진적 개선(비 SOTA) + PoC 프로젝트 기반 유지 + G0 지연 | **$500~700M** |
| 하방 | 강력한 연구 포트폴리오 + 엔터프라이즈 파이프라인만, 벤치마크 검증·매출 전환 없음 | **$300~500M** |

---

## Appendix A: 연구진 (미완성 — 추가 예정)

### A.1 Prof. Jinwoo Shin (KAIST) — Chief Scientist
전문: AI/ML 이론, VLA 아키텍처, RL for robotics, 데이터 파이프라인

| 논문 | 요약 |
|------|------|
| HAMLET (NeurIPS 2025) | 경량 메모리 모듈 + moment tokens. GR00T N1.5 LIBERO 95.6→97.7%, 히스토리 태스크 +47.2%. RLDX v1.4 Memory Module 직접 기반. [arxiv](https://arxiv.org/abs/2510.00695) |
| Robot-R1 (NeurIPS 2025) | DeepSeek-R1 스타일 RL for embodied reasoning. 다음 keypoint 상태 예측 후 정확한 예측 강화. VLA RL self-improvement 경로. [arxiv](https://arxiv.org/abs/2506.00070) |
| RS-CL | proprioceptive state 기반 contrastive loss. RoboCasa PnP 30.8→41.5%, 실 로봇 45.0→58.3%. [arxiv](https://arxiv.org/abs/2510.01711) |
| MG-Select | verifier-free 테스트타임 샘플링. KL divergence를 confidence metric으로 사용. [arxiv](https://arxiv.org/abs/2510.05681) |
| ContextVLA | 과거 관찰을 단일 context token으로 압축. 효율적 멀티프레임 VLA. [arxiv](https://arxiv.org/abs/2510.04246) |
| RoboCurate (ICML 2026 sub) | 합성 데이터 프레임워크: I2I scene editing + V2V appearance transfer + simulator-replay 필터링. ALLEX +179.9%, GR-1 +70.1%. [arxiv](https://arxiv.org/abs/2602.18742) |
| MMP | 동적 장면 단안 기하학 추정. RLWRLD 지원. [arxiv](https://arxiv.org/abs/2505.01737) |

### A.2 Prof. Minsu Cho (POSTECH) — Principal Scientist
전문: 3D 비전, dexterous grasping, affordance, compact world models

| 논문 | 요약 |
|------|------|
| DextER (CVPR 2026) | 언어 기반 dexterous grasp. 손가락 링크가 오브젝트 어디 접촉할지 autoregressive 예측. Qwen2.5 0.5B + PartField. DexGYS 67.14% (SOTA +3.83%p). [arxiv](https://arxiv.org/abs/2601.16046) |
| CompACT (CVPR 2026) | 관찰을 8 discrete token으로 압축하는 latent world model. 계획 ~40x 속도, 행동 오차 ~3x 감소. [arxiv](https://arxiv.org/abs/2603.05438) |
| Affostruction (CVPR 2026) | 부분 RGBD에서 생성적 멀티뷰 재구성으로 3D affordance grounding. 19.1 aIoU (+40.4%). [arxiv](https://arxiv.org/abs/2601.09211) |
| Affogato | 150K 인스턴스 오픈보캐블러리 affordance 벤치마크. [arxiv](https://arxiv.org/abs/2506.12009) |

### A.3 Prof. Hanbyul Joo (SNU) — Principal Scientist
전문: 3D human understanding, video diffusion, dexterous world models

| 논문 | 요약 |
|------|------|
| DWM (CVPR 2026) | dexterous 손 상호작용용 scene-action-conditioned video diffusion. 정적 3D 장면 + egocentric 손 메시 조건화. [arxiv](https://arxiv.org/abs/2512.17907) |
| TAVID (ICLR 2026) | target-aware video diffusion. [TGT] 특수 토큰으로 타깃 공간 정보 인코딩. 로봇 팔에도 일반화. [arxiv](https://arxiv.org/abs/2503.18950) |
| OOR (ICCV 2025) | 2D diffusion에서 3D object-object 공간 관계 학습. [arxiv](https://arxiv.org/abs/2503.19914) |

### A.4 Prof. Sungjoon Choi (Korea University) — Principal Scientist
전문: Robot learning, human motion, interactive systems

| 논문 | 요약 |
|------|------|
| MoLaM (ICCV 2025) | 양방향 motion↔text 멀티턴 대화 통합 아키텍처. 82.7K 멀티턴 데이터셋. [arxiv](https://arxiv.org/abs/2410.05628) |

### A.5 추가 연구 링크
- https://arxiv.org/abs/2510.27607
- https://arxiv.org/abs/2411.01281
- https://nahyuklee.github.io/cmnet/
- https://wookiekim.github.io/SOLACE/
- https://slime0519.github.io/mogaf/
- https://www.youtube.com/watch?v=qT2UZ3oN4xI

---

## Appendix B: RLDX 벤치마크 상세 (BoD p.6, v1.3.0 기준)

| 벤치마크 | RLDX v1.3.0 | GR00T N1.5 |
|---------|------------|-----------|
| Calvin ABC→D | 51.3% | 53.6% |
| LIBERO S+O+G | 95.9% | 95.7% |
| LIBERO Long | 43.2% | **53.8%** |
| RoboCasa Kitchen PnP | 83.7% | 85.7% |
| RoboCasa Kitchen OoC | **65.6%** | 59.4% |
| RoboCasa Kitchen Others | 41.7% | 추정 상회 |
| RoboCasa Kitchen Avg | 62.7% | **64.1%** |
| Simpler WidowX | 44.5% (Q99-norm 후) | 62.0% (재현 29.2%) |

참고 SOTA: Cosmos Policy LIBERO 98.5% / HAMLET(자체) on GR00T N1.5 LIBERO 97.7%

## Appendix C: 추론 속도 비교 (BoD p.10, RTX 5090, 2-view)

| 모델 | Native | TRT 최적화 |
|------|--------|-----------|
| RLDX v1.3.0 (6.86B) | 17.6 Hz | 22.8 Hz |
| RLDX v1.3.1 (6.86B) | 20.6 Hz | 30.3 Hz |
| RLDX v1.4.0 (8.03B) | 11.2 Hz | 15.5 Hz |
| GR00T N1.6 (3B) | 17.3 Hz | 27.3~32.1 Hz (single-view) |

---

## 모니터링 포인트
- [ ] 4월 Technical Report 공개 여부 및 벤치마크 결과
- [ ] BMW PoC 결과 + 계약 전환
- [ ] G0 오픈소스 릴리즈
- [ ] Series A 클로징 여부 및 최종 밸류에이션
