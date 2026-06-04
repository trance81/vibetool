# AGENTS.md
<!-- AI 에이전트용 프로젝트 지침 (단일 원본 문서) -->

Single source of truth for **Claude Code**, **Cursor**, and other AI coding agents in this repository.  
Do not duplicate this content in `.cursor/rules/` — rules only add Cursor-specific globs and session habits.

> Claude Code·Cursor 등 AI 코딩 도구가 이 저장소에서 따라야 할 **단일 기준 문서**입니다.  
> `.cursor/rules/`에는 같은 내용을 복사하지 말고, Cursor 전용 설정(globs 등)만 두세요.

## Commands
<!-- 명령어 -->

```bash
npm install --legacy-peer-deps   # Install dependencies (legacy flag required)
# 의존성 설치 (legacy-peer-deps 플래그 필요)

npm run dev                      # Dev server at http://localhost:3000
# 개발 서버 실행 (http://localhost:3000)

npm run build                    # Production build (Vite)
# 프로덕션 빌드

npm run lint                     # Type-check (tsc --noEmit)
# 타입 검사

npm run clean                    # Remove dist/
# dist 폴더 삭제
```

After substantive changes, run `npm run lint` and `npm run build`.

> 의미 있는 변경 후에는 `npm run lint`와 `npm run build`를 실행하세요.

## Architecture
<!-- 아키텍처 -->

### Dual-server model
<!-- 이중 서버 구조 -->

- **Local dev (`npm run dev`)**: `server.ts` (Express + Vite). API routes on Express, then Vite middleware for the SPA.
- **Vercel production**: SPA from `dist/`, `api/` as Serverless Functions.

> - **로컬**: `server.ts`가 API를 처리한 뒤 Vite로 프론트를 서빙합니다.  
> - **배포(Vercel)**: 빌드 결과(`dist`) + `api/` 서버리스 함수.

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

- **`title`**: Tool name on the home grid — up to **2 lines** (`line-clamp-2`); the card always reserves a **2-line** slot; shorter titles are **vertically centered** in that slot
- **`description`**: Copy for `ToolCard` — up to **4 lines** (`line-clamp-4`); the card always reserves a **4-line** slot; text shorter than 2 lines is **vertically centered** in that slot (implemented in `ToolCard.tsx`)
- **`routeDescription`** (optional): Longer line for the tool page header in `ToolLayout`; falls back to `description`

> - **title**: 메인 카드 제목, 최대 2줄. 카드에는 항상 2줄 높이를 확보하고, 한 줄일 때는 그 영역 안에서 세로 가운데 정렬  
> - **description**: 카드 설명, 최대 4줄. 카드에는 항상 4줄 높이를 확보하고, 2줄 미만이면 그 영역 안에서 세로 가운데 정렬 (`ToolCard.tsx`)  
> - **routeDescription**(선택): 도구 페이지 상단 설명. 없으면 `description` 사용  

### `fillViewport` layout
<!-- fillViewport 레이아웃 -->

Use `fillViewport: true` on the tool entry in `tools-config` when the tool is a **full-height panel** (grids, editors, split views) that should scroll **inside** the page, not grow the main window.

> 그리드·에디터·분할 화면처럼 **화면 전체 높이**를 쓰는 도구는 `tools-config`에 `fillViewport: true`를 넣습니다. 메인 창이 아니라 **도구 안에서만** 스크롤되게 합니다.

Current tools with `fillViewport`: `markdown-viewer`, `emoji-picker`, `free-icons`.  
New similar tools should match a peer (e.g. emoji-picker ↔ free-icons).

> 현재 적용: `markdown-viewer`, `emoji-picker`, `free-icons`. 비슷한 UI는 이 중 하나와 같은 패턴을 따르세요.

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

### Privacy model
<!-- 개인정보·처리 위치 -->

Most tools run **entirely in the browser**. Server-side only:

- URL shortener (proxies is.gd)
- Currency converter (proxies exchange APIs: Frankfurter → open.er-api → jsDelivr fallback)

> 대부분 **브라우저에서만** 처리합니다. 서버를 쓰는 경우: URL 단축(is.gd 프록시), 환율(외부 API 프록시, 다중 폴백).

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

## Prompt template (Claude / Cursor)
<!-- 프롬프트 예시 (Claude / Cursor 공통) -->

```
{feature} — follow AGENTS.md checklist.
Reference: src/pages/tools/{SimilarTool}.tsx
Register in tools-config + tool-routes; fillViewport like peer if applicable.
```

> `{기능} 추가. AGENTS.md 체크리스트 준수.`  
> `참고: src/pages/tools/{비슷한도구}.tsx`  
> `tools-config + tool-routes 등록, 필요 시 fillViewport는 유사 도구와 동일`  

## File map (quick)
<!-- 파일 위치 빠른 참조 -->

| Concern | Location |
|--------|----------|
| Tool metadata | `src/lib/tools-config.ts` |
| Tool components map | `src/lib/tool-routes.tsx` |
| Routes | `src/App.tsx` |
| Shared shell | `src/components/ToolLayout.tsx` |
| Home grid | `src/pages/Dashboard.tsx`, `src/components/ToolCard.tsx` |
| Local API | `server.ts`, `lib/exchange-service.ts` |
| Vercel API | `api/` |

| 항목 | 위치 |
|------------|------|
| 도구 메타데이터 | `src/lib/tools-config.ts` |
| 도구 컴포넌트 맵 | `src/lib/tool-routes.tsx` |
| 라우트 | `src/App.tsx` |
| 공통 레이아웃 | `src/components/ToolLayout.tsx` |
| 메인 그리드 | `src/pages/Dashboard.tsx`, `src/components/ToolCard.tsx` |
| 로컬 API | `server.ts`, `lib/exchange-service.ts` |
| Vercel API | `api/` |
