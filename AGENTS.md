# AGENTS.md
<!-- AI 에이전트용 프로젝트 지침 (단일 원본 문서) -->

Single source of truth for **Claude Code**, **Cursor**, and other AI coding agents in this repository.  
Do not duplicate this content in `.cursor/rules/` — rules only add Cursor-specific globs and session habits.

> Claude Code·Cursor 등 AI 코딩 도구가 이 저장소에서 따라야 할 **단일 기준 문서**입니다.  
> `.cursor/rules/`에는 같은 내용을 복사하지 말고, Cursor 전용 설정(globs 등)만 두세요.

**Document convention:** Body text in **English** (for agents). Section labels use `<!-- Korean -->`; human-readable Korean follows in `>` blockquotes. Same pattern in `CLAUDE.md`, `README.md`, and `**/SKILL.md`.

> **문서 규칙:** 본문은 영문(에이전트용) · 섹션 제목은 `<!-- 한글 -->` · 설명은 `>` 인용 한글. CLAUDE·README·스킬도 동일.

## Harness (this repository)
<!-- 경량 하네스 — revfactory/harness를 단일 개발·도구 모음 규모에 맞게 축소 -->

This repo uses a **coding harness** (not a full eval/orchestration harness): registry code + docs + optional skills.

> **코딩 하네스**입니다. 멀티 에이전트 팀·Phase 0~7 전체 harness는 도입하지 않습니다.

| Layer | Location | Role |
|-------|----------|------|
| SSOT | `AGENTS.md` (this file) | Architecture, checklists, conventions |
| Claude entry | `CLAUDE.md` | Harness triggers + changelog; links here |
| Prompt templates | `PROMPT.md` | Copy-paste feature prompts (Cursor / Claude) |
| Cursor rules | `.cursor/rules/*.mdc` | Globs + habits only — **no** full AGENTS paste |
| Skills | `.cursor/skills/`, `.claude/skills/` | `vibe-add-tool`, `vibe-harness-audit`, `vibe-dual-server-api`, `vibe-verify` |
| Structural code | `tools-config.ts`, `tool-routes.tsx`, `App.tsx` | Tool IDs and routes stay in sync |

> | 레이어 | 위치 | 역할 |
> |--------|------|------|
> | SSOT | AGENTS.md | 아키텍처·체크리스트 |
> | Claude 진입 | CLAUDE.md | 트리거·변경 이력 |
> | 프롬프트 | PROMPT.md | Cursor/Claude 복사 템플릿 |
> | Cursor rules | .cursor/rules/ | globs·습관만 |
> | 스킬 | .cursor/skills · .claude/skills | 워크플로 |
> | 구조 코드 | tools-config · tool-routes · App | id·라우트 동기화 |

**When to load a skill**

- New tool / registration → `vibe-add-tool`
- Registry or doc drift audit → `vibe-harness-audit`
- `server.ts` or `api/` change → `vibe-dual-server-api`
- After implementation → `vibe-verify` (lint + build + `check:registry`)

> - 새 도구 → vibe-add-tool · 점검 → vibe-harness-audit · API → vibe-dual-server-api · 구현 후 → vibe-verify

Cursor: skills under `.cursor/skills/` may auto-apply from `description` frontmatter; for important tasks attach `@AGENTS.md`.  
Claude Code: read `CLAUDE.md` triggers, then the matching `.claude/skills/*/SKILL.md`.

> Cursor는 `.cursor/skills/` · Claude는 `.claude/skills/` + `CLAUDE.md` 트리거. 스킬 본문을 바꾸면 **양쪽 디렉터리**를 맞춥니다.

**What we do not adopt** (from [harness-100](https://github.com/revfactory/harness-100), [OpenSpace](https://github.com/HKUDS/OpenSpace)): multi-agent teams, cloud skill evolution, or autonomous multi-hour builds. This repo stays a **single-agent, minimal-diff** coding harness.

> 대형 하네스(멀티 에이전트·자율 장시간 빌드·클라우드 스킬 진화)는 도입하지 않습니다.

### Verifiable gates
<!-- 검증 가능한 게이트 (Anthropic long-running harness에서 차용, 축소) -->

After code changes, run (in order when possible):

```bash
npm run lint
npm run build
npm run check:registry   # ALL_TOOLS ↔ TOOL_PAGE_REGISTRY ↔ TOOL_GROUPS
```

Do not claim “done” without exit code 0 from commands you actually ran. Prefer `vibe-verify` skill for a skeptical post-change pass ([Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps): separate verification from generation).

> 완료 선언 전 **lint · build · check:registry**를 실행하고, 실패 시 수정합니다.

### Agent behavior (constitution)
<!-- CLAUDE.md / Vault-style 행동 지침 (gpters 지식베이스 글에서 차용, 코드 저장소용) -->

- **Read before edit** — open the file (or a close peer) before changing it
- **Minimal diff** — one logical change per request when possible; large features → one tool or one concern at a time
- **Uncertain placement** — if tool group, id, or API shape is unclear, **ask the user**; do not guess registration
- **No destructive git** — no force push, hard reset, or file deletes unless the user explicitly asks
- **No secrets in commits** — never commit `.env`, tokens, or credentials
- **Multi-session work** — optional handoff: copy [docs/agent/HANDOFF.template.md](./docs/agent/HANDOFF.template.md)

> 불명확하면 등록을 추측하지 말고 사용자에게 확인합니다.

### UI acceptance (new/changed tool pages)
<!-- 프론트 품질 루브릭 (Anthropic 디자인 기준을 이 프로젝트에 맞게 축소) -->

| Criterion | Expectation |
|-----------|-------------|
| **Coherence** | Dark theme, indigo accent, Shadcn primitives — matches existing tools |
| **Usability** | Primary action obvious; labels in Korean for user-facing copy |
| **Layout** | `fillViewport` only when the tool is a full-height panel; internal scroll only |
| **Avoid** | Generic “AI slop” (purple-on-white cards, unrelated gradients) — this app is dark-only |

> | 기준 | 기대 |
> |------|------|
> | **일관성** | 다크·인디고·Shadcn, 기존 도구와 동일 톤 |
> | **사용성** | 주요 동작이 분명 · UI 문구 한국어 |
> | **레이아웃** | 전체 높이 UI만 fillViewport · 내부 스크롤만 |
> | **지양** | 흰 배경+보라 그라데이션 등 generic AI UI (이 앱은 다크 전용) |

### External references
<!-- 하네스 구축 참고 (이 저장소에 맞게 일부만 반영) -->

| Source | Relevant idea | Applied here |
|--------|---------------|--------------|
| [revfactory/harness-100](https://github.com/revfactory/harness-100) | Trigger boundaries, skills, changelog | `CLAUDE.md`, skill `description`, NOT-trigger sections |
| [Anthropic long-running harness](https://www.anthropic.com/engineering/harness-design-long-running-apps) | Verifiable gates, skeptical evaluation, one feature at a time | `check:registry`, `vibe-verify`, gates above |
| [gpters Obsidian KB](https://www.gpters.org/nocode/post/knowledge-base-builder-connecting-jH9PdQQcudtVDc0) | `CLAUDE.md` as constitution, structured rules | Agent behavior + `HANDOFF.template.md` |
| [HKUDS/OpenSpace](https://github.com/HKUDS/OpenSpace) | Self-evolving shared skills | **Not** used — project skills are manual, versioned in git |

> | 출처 | 가져온 아이디어 | 이 저장소 적용 |
> |------|----------------|----------------|
> | harness-100 | 트리거·스킬·changelog | CLAUDE.md · 스킬 NOT-trigger |
> | Anthropic | 검증 게이트·회의적 평가 | check:registry · vibe-verify |
> | gpters | CLAUDE 헌법·구조화 규칙 | 행동 지침 · HANDOFF 템플릿 |
> | OpenSpace | 클라우드 자기진화 스킬 | **미도입** — git 수동 스킬 |

## Commands
<!-- 명령어 -->

```bash
npm install --legacy-peer-deps   # Install dependencies (legacy flag required)
# 의존성 설치 (legacy-peer-deps 플래그 필요)

npm run dev                      # Dev server at http://localhost:3000
# 개발 서버 실행 (http://localhost:3000)

npm run build:erp-json           # CSV → JSON for ERP column API (auto in dev/build)
# ERP 컬럼 CSV를 JSON으로 변환 (dev/build 시 자동 실행)

npm run build                    # build:erp-json + Vite production build
# ERP JSON 생성 후 프로덕션 빌드

npm run lint                     # Type-check (tsc --noEmit)
# 타입 검사

npm run clean                    # Remove dist/
# dist 폴더 삭제

npm run check:registry           # Tool id registry sync (harness check)
# 도구 id 레지스트리 동기화 검사
```

After substantive changes, run `npm run lint`, `npm run build`, and `npm run check:registry` when tools or routes changed.

> 의미 있는 변경 후: `npm run lint` · `npm run build` · (도구/라우트 변경 시) `npm run check:registry`

## Architecture
<!-- 아키텍처 -->

### Dual-server model
<!-- 이중 서버 구조 -->

- **Local dev (`npm run dev`)**: `server.ts` (Express + Vite). API routes on Express, then Vite middleware for the SPA.
- **Vercel production**: SPA from `dist/`, `api/` as Serverless Functions. See **`vercel.json`** (SPA rewrites, `includeFiles` for ERP JSON).

> - **로컬**: `server.ts`가 API를 처리한 뒤 Vite로 프론트를 서빙합니다.  
> - **배포(Vercel)**: 빌드 결과(`dist`) + `api/` 서버리스 함수. ERP 데이터는 `vercel.json`의 `includeFiles`로 함수 번들에 포함됩니다.

API logic is **duplicated** in `server.ts` (local) and `api/*.ts` (Vercel). **Always update both** when changing server behavior.

> API 로직은 `server.ts`(로컬)와 `api/*.ts`(Vercel)에 **둘 다** 있습니다. 서버 동작을 바꿀 때 **항상 양쪽을 함께** 수정하세요.

### Tool registration (structural harness)
<!-- 도구 등록 (구조적 하네스) -->

Tools are registered in **`src/lib/tools-config.ts`** (`ALL_TOOLS`, `TOOL_GROUPS`). Routes are generated from that registry in **`src/lib/tool-routes.tsx`** and **`src/App.tsx`**.

> 도구 메타는 `tools-config.ts`, 화면 컴포넌트 연결은 `tool-routes.tsx`, 라우트는 `App.tsx`가 레지스트리에서 자동 생성합니다.

When adding a tool:

1. Create `src/pages/tools/{ComponentName}.tsx`
2. Register in `src/lib/tools-config.ts` (`ALL_TOOLS` + `TOOL_GROUPS`)
3. Register the React component in `src/lib/tool-routes.tsx` (`TOOL_PAGE_REGISTRY`)
4. If the tool needs a server API, update **`server.ts`** and **`api/`** together
5. Run `npm run lint` and `npm run build`

> **새 도구 추가 순서**  
> 1. `src/pages/tools/{이름}.tsx` 페이지 생성  
> 2. `tools-config.ts`에 `ALL_TOOLS`·`TOOL_GROUPS` 등록  
> 3. `tool-routes.tsx`의 `TOOL_PAGE_REGISTRY`에 컴포넌트 등록  
> 4. 서버 API가 필요하면 `server.ts`와 `api/` **동시** 수정  
> 5. `npm run lint` · `npm run build` 실행  

### Dashboard card copy (`tools-config`)
<!-- 대시보드 카드 문구 -->

- **`title`**: Tool name on the home grid — **1 line** (`line-clamp-1`); the card always reserves a **1-line** slot; shorter titles are **vertically centered** in that slot
- **`description`**: Copy for `ToolCard` — **1 line** (`line-clamp-1`); the card always reserves a **1-line** slot; shorter text is **vertically centered** in that slot (implemented in `ToolCard.tsx`)
- **`routeDescription`** (optional): Longer line for the tool page header in `ToolLayout`; falls back to `description`

> - **title**: 메인 카드 제목, 1줄 (`line-clamp-1`). 카드에는 항상 1줄 높이를 확보  
> - **description**: 카드 설명, 1줄 (`line-clamp-1`). 카드에는 항상 1줄 높이를 확보 (`ToolCard.tsx`)  
> - **routeDescription**(선택): 도구 페이지 상단 설명. 없으면 `description` 사용  

### `fillViewport` layout
<!-- fillViewport 레이아웃 -->

Use `fillViewport: true` on the tool entry in `tools-config` when the tool is a **full-height panel** (grids, editors, split views) that should scroll **inside** the page, not grow the main window.

> 그리드·에디터·분할 화면처럼 **화면 전체 높이**를 쓰는 도구는 `tools-config`에 `fillViewport: true`를 넣습니다. 메인 창이 아니라 **도구 안에서만** 스크롤되게 합니다.

Current tools with `fillViewport`: `markdown-viewer`, `emoji-picker`, `free-icons`, `erp-column-lookup`.  
New similar tools should match a peer (e.g. emoji-picker ↔ free-icons, erp-column-lookup for search + internal scroll).

> 현재 적용: `markdown-viewer`, `emoji-picker`, `free-icons`, `erp-column-lookup`. 검색·내부 스크롤 패널은 `erp-column-lookup` 참고.

Implementation: `ToolLayout` (`src/components/ToolLayout.tsx`) sets `flex-1 min-h-0 overflow-hidden` on the content area; the tool root should use `flex flex-1 flex-col min-h-0` and put `overflow-y-auto` on inner panes only.

> `ToolLayout`이 콘텐츠 영역 높이를 잡고, 도구 루트는 `flex-1 min-h-0`, 스크롤은 **내부 패널**에만 `overflow-y-auto`를 씁니다.

### Path aliases
<!-- 경로 별칭 -->

`@/*` resolves to the **project root** (not `src/`). Both `@/src/components/...` and `@/components/ui/...` are valid.

> `@/*`는 **프로젝트 루트**를 가리킵니다(`src/` 아님). `@/src/...`와 `@/components/ui/...` 둘 다 사용 중입니다.

### Styling
<!-- 스타일 -->

Dark-only theme. CSS variables live in `src/index.css` (`@theme`). No light mode. Primary accent: indigo (`#818cf8`). Tailwind v4 via `@tailwindcss/vite`; no `tailwind.config.js`.

> 다크 테마만 있습니다. 색·radius는 `src/index.css`의 `@theme`. 포인트 색: 인디고. Tailwind v4.

Prefer existing Shadcn UI primitives under `components/ui/`. Use `sonner` for toasts.

> UI는 `components/ui`의 Shadcn 컴포넌트를 재사용하고, 알림은 `sonner`를 씁니다.

### Home dashboard layout
<!-- 메인 대시보드 레이아웃 -->

On `/`, `ToolLayout` locks the viewport (`h-dvh`): **header + left sidebar + footer stay fixed**; only the **tool category grid** scrolls (`Dashboard.tsx`).

> 홈(`/`)은 헤더·좌측 사이드바·하단 푸터 고정, **카테고리(도구 카드) 영역만** 스크롤됩니다.

### ERP column lookup (`erp-column-lookup`)
<!-- ERP 컬럼 조회 — 서버 데이터·PIN·JSON 파이프라인 -->

Internal tool: table/column search over ERP metadata. **PIN required on every visit** (no session persistence).

| Concern | Location / behavior |
|---------|---------------------|
| UI | `src/pages/tools/ErpColumnLookup.tsx` — `fillViewport: true` |
| PIN verify | `src/lib/erp-column-pin.ts` (SHA-256 hash only; no plain PIN stored) |
| Data service | `lib/erp-column-service.ts` — reads **JSON at runtime**, not CSV |
| Source CSV | `src/Files/ERP_컬럼정보_*.csv` — latest file by timestamp in filename |
| Build step | `scripts/build-erp-json.mjs` → `ERP_컬럼정보_{ts}.json` + `.meta.json` |
| npm scripts | `build:erp-json` runs before `dev` and `build` |
| Generated JSON | gitignored; produced on dev/build (Vercel build must run `npm run build`) |
| Local API | `server.ts` — `/api/erp-columns/{meta,modules,search,table}` |
| Vercel API | `api/erp-columns/*.ts` + `vercel.json` `includeFiles: "src/Files/**"` |

**When CSV is updated:** drop new `ERP_컬럼정보_YYYYMMDDHHmm.csv` in `src/Files/`, run `npm run build:erp-json` (or `npm run dev` / `npm run build`). Commit the **CSV**; JSON is regenerated.

**API contracts:** `GET /api/erp-columns/meta` → `{ sourceCsv, timestamp, timestampLabel, rowCount, modules }`; search/table use full rows JSON.

> - **PIN**: 도구 진입할 때마다 입력 (sessionStorage 미사용)  
> - **원본**: `src/Files/ERP_컬럼정보_*.csv` (git)  
> - **런타임**: `build:erp-json`이 만든 `.json` / `.meta.json` (gitignore, 빌드·dev 시 생성)  
> - **CSV 교체**: 새 CSV 추가 후 `npm run build:erp-json` 또는 dev/build 재실행  
> - **Vercel**: `vercel.json`으로 JSON 파일을 서버리스 함수에 포함  

### Privacy model
<!-- 개인정보·처리 위치 -->

Most tools run **entirely in the browser**. Server-side only:

- URL shortener (proxies is.gd)
- Currency converter (proxies exchange APIs: Frankfurter → open.er-api → jsDelivr fallback)
- ERP column lookup (reads bundled JSON metadata; PIN checked in browser)

> 대부분 **브라우저에서만** 처리합니다. 서버: URL 단축, 환율 프록시, **ERP 컬럼 조회**(번들된 JSON 읽기·PIN은 브라우저에서 검증).

## AI workflow conventions
<!-- AI 작업 규칙 -->

- **Minimal diff** — only change what the task requires
- **Match existing patterns** — read a similar tool before implementing
- **No commits** unless the user explicitly asks
- **Korean** for user-facing strings in the UI when adding copy; AGENTS.md stays English for agents

> - **최소 변경**만  
> - 비슷한 기존 도구를 먼저 참고  
> - 사용자가 요청할 때만 git commit  
> - UI 문구는 한국어, 이 문서(AGENTS.md)는 에이전트용으로 영문 유지  

## Prompt cookbook
<!-- 프롬프트 작성 가이드 (복사용 템플릿) -->

**Korean-only** copy-paste templates for **Cursor** and **Claude Code**: **[PROMPT.md](./PROMPT.md)**.

> 기능 추가 전 **PROMPT.md** 한글 블록 복사·`[ ]` 채우기. Cursor: `@PROMPT.md` `@AGENTS.md` 권장.

Minimal one-liner:

```
{feature} — follow AGENTS.md + PROMPT.md + vibe-add-tool checklist.
Reference: src/pages/tools/{SimilarTool}.tsx
Register in tools-config + tool-routes; fillViewport like peer if applicable.
Verify: npm run lint, npm run build, npm run check:registry. No commit unless asked.
```

> Cursor: `@PROMPT.md` `@AGENTS.md` · Claude: PROMPT.md + AGENTS.md + vibe-add-tool  

## File map (quick)
<!-- 파일 위치 빠른 참조 -->

| Concern | Location |
|--------|----------|
| Tool metadata | `src/lib/tools-config.ts` |
| Tool components map | `src/lib/tool-routes.tsx` |
| Routes | `src/App.tsx` |
| Shared shell | `src/components/ToolLayout.tsx` |
| Home grid | `src/pages/Dashboard.tsx`, `src/components/ToolCard.tsx` |
| Local API | `server.ts`, `lib/exchange-service.ts`, `lib/erp-column-service.ts` |
| Vercel API | `api/`, `vercel.json` |
| ERP JSON build | `scripts/build-erp-json.mjs`, `src/Files/` |

| 항목 | 위치 |
|------------|------|
| 도구 메타데이터 | `src/lib/tools-config.ts` |
| 도구 컴포넌트 맵 | `src/lib/tool-routes.tsx` |
| 라우트 | `src/App.tsx` |
| 공통 레이아웃 | `src/components/ToolLayout.tsx` |
| 메인 그리드 | `src/pages/Dashboard.tsx`, `src/components/ToolCard.tsx` |
| 로컬 API | `server.ts`, `lib/exchange-service.ts`, `lib/erp-column-service.ts` |
| Vercel API | `api/`, `vercel.json` |
| ERP JSON 빌드 | `scripts/build-erp-json.mjs`, `src/Files/` |
