# ClawVault 마이그레이션 체크리스트 (2026-03-10)

## Phase 1: 설치 & 초기화
- [ ] ClawVault CLI 설치 (npm install -g clawvault)
- [ ] jino-memory 레포에 vault 초기화
- [ ] 기존 폴더 구조 → ClawVault 구조 매핑 확인

## Phase 2: 메모리 마이그레이션
- [ ] warm-memory/lessons.md → lessons/ 
- [ ] jino-memory/daily/*.md → 유지 (ClawVault inbox로 연동)
- [ ] MEMORY.md → decisions/ + 장기 메모리
- [ ] warm-memory/todo.md → tasks/
- [ ] warm-memory/knowledge-base/ → 유지 or projects/

## Phase 3: 크론 업데이트
- [ ] brain-memory: wake/checkpoint/sleep 방식으로 재작성
- [ ] email-summary: ClawVault inbox 연동
- [ ] auto-study: 결과를 ClawVault에 저장
- [ ] portfolio-research: ClawVault projects/ 저장
- [ ] morning-briefing: ClawVault context 활용

## Phase 4: AGENTS.md / SOUL.md 업데이트
- [ ] 세션 시작 절차 업데이트 (clawvault wake)
- [ ] 메모리 참조 방식 업데이트

## Phase 5: 검증 & 푸시
- [ ] 전체 구조 확인
- [ ] git commit & push
