---
name: tmux-claudecode
description: tmux로 Claude Code CLI 세션 제어 (코드 작업, 이슈 픽스)
---

# tmux-claudecode

tmux로 Claude Code CLI 세션을 제어해서 코드 작업을 시킨다.

## 언제 쓰나

- 코드 작업 (구현, 리팩토링, 버그 픽스)
- 멀티스텝 태스크
- 병렬 작업 (여러 세션 동시 실행)
- 백그라운드 작업 (채팅 블록 안 함)

## 설정

- Claude Code CLI: `/usr/local/bin/claude` (v2.1.63+)
- 인증: `~/.claude/.credentials.json` (claudeAiOauth)
- tmux 소켓: `${TMPDIR:-/tmp}/openclaw-tmux-sockets/openclaw.sock`
- 세션 추적: `~/clawd/warm-memory/tmux-sessions.json`

## Quick Start

```bash
SOCKET="${TMPDIR:-/tmp}/openclaw-tmux-sockets/openclaw.sock"

# 세션 생성 + Claude Code 실행
tmux -S "$SOCKET" new -d -s "claudecode-myproject" -c ~/myproject
tmux -S "$SOCKET" resize-window -t "claudecode-myproject" -x 300 -y 80
tmux -S "$SOCKET" send-keys -t "claudecode-myproject" 'claude --dangerously-skip-permissions' Enter

# 3초 대기 후 프롬프트 전송
sleep 3
tmux -S "$SOCKET" send-keys -t "claudecode-myproject" -l 'Fix bug in auth module. Commit and push when done.'
tmux -S "$SOCKET" send-keys -t "claudecode-myproject" Enter
```

## 프롬프트 규칙

- **영어로 작성** (Claude Code 최적화)
- **`-l` 플래그 필수** (특수문자 처리)
- **끝에 "Commit and push when done"** (완료 기준 명확화)
- `--dangerously-skip-permissions` 플래그로 permission 프롬프트 스킵

## 워크플로우

### 1. 세션 생성

```bash
SOCKET="${TMPDIR:-/tmp}/openclaw-tmux-sockets/openclaw.sock"
SESSION="claudecode-myproject"
PROJECT_DIR=~/myproject

tmux -S "$SOCKET" new -d -s "$SESSION" -c "$PROJECT_DIR"
tmux -S "$SOCKET" resize-window -t "$SESSION" -x 300 -y 80
tmux -S "$SOCKET" send-keys -t "$SESSION" 'claude --dangerously-skip-permissions' Enter
```

### 2. 프롬프트 전송

```bash
sleep 3  # Claude Code 초기화 대기
tmux -S "$SOCKET" send-keys -t "$SESSION" -l 'Your task here. Commit and push when done.'
tmux -S "$SOCKET" send-keys -t "$SESSION" Enter
```

### 3. 상태 확인

```bash
tmux -S "$SOCKET" capture-pane -p -J -t "${SESSION}":0.0 -S -100
```

**상태 판단:**

| 상태     | 신호 |
|----------|------|
| thinking | 프로그레스바 움직임, tool 실행 중 |
| ready    | 셸 프롬프트 (`❯` 또는 `$`), 체크리스트 완료 |
| error    | 에러 메시지, rate limit |
| stuck    | 15분 이상 변화 없음 |

### 4. 완료 확인

- 셸 프롬프트 복귀 (`❯` 또는 `$`)
- "Committed and pushed" 메시지
- `/compact` 또는 task 완료 표시

## 모델 변경

Claude Code 시작 시 `--model` 플래그 사용:

```bash
tmux -S "$SOCKET" send-keys -t "$SESSION" 'claude --dangerously-skip-permissions --model claude-opus-4-5' Enter
```

또는 세션 중 `/model` 명령:

```bash
tmux -S "$SOCKET" send-keys -t "$SESSION" -l '/model'
tmux -S "$SOCKET" send-keys -t "$SESSION" Enter
```

## Rate Limit 복구

```bash
# ESC로 취소
tmux -S "$SOCKET" send-keys -t "$SESSION" Escape
sleep 1
# 계속 진행
tmux -S "$SOCKET" send-keys -t "$SESSION" -l 'continue'
tmux -S "$SOCKET" send-keys -t "$SESSION" Enter
```

## Idle 세션 채찍질

```bash
tmux -S "$SOCKET" send-keys -t "$SESSION" Escape
tmux -S "$SOCKET" send-keys -t "$SESSION" -l 'continue'
tmux -S "$SOCKET" send-keys -t "$SESSION" Enter
```

## 병렬 이슈 작업

```bash
# 이슈별 worktree
git worktree add ../project-issue-1 -b feature/issue-1
git worktree add ../project-issue-2 -b feature/issue-2

# 세션별 작업
SOCKET="${TMPDIR:-/tmp}/openclaw-tmux-sockets/openclaw.sock"
tmux -S "$SOCKET" new -d -s "issue-1" -c ~/project-issue-1
tmux -S "$SOCKET" new -d -s "issue-2" -c ~/project-issue-2
```

또는 Claude Code 내장 worktree 기능:

```bash
tmux -S "$SOCKET" send-keys -t "$SESSION" 'claude --worktree --dangerously-skip-permissions' Enter
```

## 세션 추적

`~/clawd/warm-memory/tmux-sessions.json`:

```json
{
  "sessions": {
    "claudecode-myproject": {
      "project": "~/myproject",
      "task": "Fix auth bug",
      "status": "running",
      "startedAt": "2026-03-02T18:00:00Z"
    }
  }
}
```

**status:** `running` | `completed` | `failed` | `stuck`

## 스크립트 사용

### 세션 생성

```bash
node ~/clawd/skills/tmux-claudecode/scripts/create-session.js <session-name> <project-dir> "<task>"
```

### 상태 확인

```bash
node ~/clawd/skills/tmux-claudecode/scripts/check-session.js <session-name>
```

### 세션 종료

```bash
SOCKET="${TMPDIR:-/tmp}/openclaw-tmux-sockets/openclaw.sock"
tmux -S "$SOCKET" kill-session -t "$SESSION"
```
