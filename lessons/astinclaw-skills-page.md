# Lesson: astinclaw.pw 스킬 페이지 구축

**날짜**: 2026-03-27  
**태그**: vercel, astinclaw, skills, i18n

---

## 배운 것

### 새 페이지 만들 때 항상 한/영 전환 버튼 포함할 것

astinclaw.pw의 모든 페이지는 KO/EN 언어 전환 기능을 갖춰야 한다.
처음 `/skills` 페이지를 만들었을 때 lang toggle을 빠뜨렸고, 사용자가 지적 후 수정했다.

**체크리스트 (새 페이지 추가 시)**:
- [ ] `lang-toggle` 버튼 (KO/EN) 네비게이션에 포함
- [ ] 모든 사용자 노출 텍스트에 `data-lang="en"` / `data-lang="ko"` 쌍으로 작성
- [ ] `setLang()` 함수 + `localStorage.getItem('lang-home')` 복원 로직 포함
- [ ] theme-toggle (다크/라이트) 포함
- [ ] nav active 상태 표시

### astinclaw.pw 기술 스택

- **호스팅**: Vercel (astinclaw-9901s-projects 팀)
- **프로젝트명**: `astinclaw-web`
- **팀 ID**: `team_Xa4PucCVeCtNRLP67fjfuXwo`
- **배포 방식**: Vercel API (`/v13/deployments`) — GitHub 연결 없음, 직접 파일 업로드
- **인증**: `~/Library/Application Support/com.vercel.cli/auth.json`
- **구조**: 정적 HTML (`src/` 루트)

### 배포 스크립트 패턴

```python
import json, base64, os, urllib.request

TOKEN = json.loads(open('/Users/astin/Library/Application Support/com.vercel.cli/auth.json').read())['token']
TEAM_ID = "team_Xa4PucCVeCtNRLP67fjfuXwo"

src_root = "/tmp/astinclaw-src/src"
files_to_upload = []
for dirpath, _, filenames in os.walk(src_root):
    for fname in filenames:
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, src_root)
        with open(fpath, 'rb') as f:
            content = f.read()
        files_to_upload.append({"file": rel, "data": base64.b64encode(content).decode(), "encoding": "base64"})

payload = json.dumps({
    "name": "astinclaw-web",
    "files": files_to_upload,
    "projectSettings": {"outputDirectory": ".", "buildCommand": None, "framework": None},
    "target": "production"
}).encode()

req = urllib.request.Request(
    f"https://api.vercel.com/v13/deployments?teamId={TEAM_ID}",
    data=payload,
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as r:
    resp = json.loads(r.read())
```

### 기존 소스 다운로드 방법

```python
# 최신 배포 ID 조회
curl "https://api.vercel.com/v6/deployments?projectId=astinclaw-web&teamId={TEAM_ID}&limit=1"

# 파일 목록 조회
curl "https://api.vercel.com/v6/deployments/{DEPLOY_ID}/files?teamId={TEAM_ID}"

# 파일 내용 다운로드 (v7, base64 인코딩)
curl "https://api.vercel.com/v7/deployments/{DEPLOY_ID}/files/{FILE_UID}?teamId={TEAM_ID}"
# → {"data": "<base64>"} 형식으로 반환
```

### 페이지 추가 시 nav 일관성 유지

**모든 페이지의 nav는 항상 동일한 메뉴 구조를 가져야 한다.**

현재 표준 메뉴 (2026-03-27 기준):
```html
<ul class="nav-links">
  <li><a href="/#identity" data-lang="en">Identity</a><a href="/#identity" data-lang="ko" style="display:none">아이덴티티</a></li>
  <li><a href="/#capabilities" data-lang="en">Capabilities</a><a href="/#capabilities" data-lang="ko" style="display:none">기능</a></li>
  <li><a href="/blog" data-lang="en">Blog</a><a href="/blog" data-lang="ko" style="display:none">블로그</a></li>
  <li><a href="/skills" data-lang="en">Skills</a><a href="/skills" data-lang="ko" style="display:none">스킬</a></li>
</ul>
```
현재 페이지에 해당하는 `<a>`에 `class="active"` 추가.

**주의**: 새 페이지를 추가하면 기존 모든 페이지의 nav도 함께 업데이트해야 한다.
업데이트 대상 파일:
- `src/index.html`
- `src/blog/index.html`
- `src/blog/*/index.html` (각 포스트)
- `src/skills/index.html`
- 이후 추가되는 모든 페이지

---

### i18n 패턴 (data-lang)

```html
<!-- lang toggle in nav -->
<div class="lang-toggle">
  <button id="btn-ko" onclick="setLang('ko')">KO</button>
  <button id="btn-en" class="active" onclick="setLang('en')">EN</button>
</div>

<!-- bilingual content -->
<span data-lang="en">English text</span>
<span data-lang="ko" style="display:none">한국어 텍스트</span>

<!-- script -->
function setLang(lang) {
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
  });
  document.getElementById('btn-ko').classList.toggle('active', lang === 'ko');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  localStorage.setItem('lang-home', lang);
}
var saved = localStorage.getItem('lang-home');
if (saved) setLang(saved);
```
