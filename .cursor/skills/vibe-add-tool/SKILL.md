---
name: vibe-add-tool
description: >-
  Use when adding or registering a new web tool in Vibe Dev Tools (tools-config,
  tool-routes, ToolLayout, fillViewport, dashboard card). Enforces the same
  checklist as AGENTS.md. Korean triggers: 도구 추가, 툴 만들기, 새 기능 페이지.
---

# Vibe Dev Tools — Add Tool
<!-- 새 웹 도구 추가·등록 워크플로 -->

Read **[AGENTS.md](../../../AGENTS.md)** first (architecture + dashboard copy rules). This skill is the step-by-step workflow.

> 먼저 **AGENTS.md**를 읽고, 이 스킬은 단계별 체크리스트입니다.

## When to use
<!-- 사용 시점 -->

- New route under `/tools/...`
- New card on the home dashboard
- Renaming or extending an existing tool’s registration

> - 새 `/tools/...` 라우트  
> - 대시보드 카드 추가  
> - 기존 도구 등록 정보 변경  

## When NOT to use
<!-- 사용하지 않을 때 -->

- README/AGENTS typo only (no registry)
- Unrelated refactor across many tools in one pass — split tasks
- User did not ask to add a tool — clarify first

> - 문서 오타만 (레지스트리 무관)  
> - 여러 도구를 한 번에 무관하게 리팩터 — 작업 분리  
> - 도구 추가 요청이 아니면 먼저 확인  

## Scale
<!-- 규모 모드 -->

| Mode | Steps |
|------|--------|
| **Full** | Page + `tools-config` + `tool-routes` + optional API + `vibe-verify` |
| **Registry-only** | Config/routes sync only (no new page) |
| **Page-only** | Component change; confirm registry already correct |

> | 모드 | 내용 |
> |------|------|
> | **Full** | 페이지 + config + routes + (필요 시) API + 검증 |
> | **Registry-only** | config/routes만 동기화 |
> | **Page-only** | 컴포넌트만 수정 (등록은 이미 맞는지 확인) |

## Workflow
<!-- 작업 순서 -->

1. **Pick a reference tool** — closest UI pattern (e.g. `EmojiPicker.tsx` for `fillViewport`, `TextCase.tsx` for simple form).

2. **Create** `src/pages/tools/{Name}.tsx` — match layout, `ToolLayout` child uses `flex flex-1 flex-col min-h-0` when `fillViewport` applies.

3. **Register metadata** in `src/lib/tools-config.ts`:
   - `ALL_TOOLS` entry: `id`, `title`, `description` (dashboard: **1-line slot**), optional `routeDescription`, `path`, `group`, optional `fillViewport`
   - `TOOL_GROUPS` includes the tool `id`

4. **Register component** in `src/lib/tool-routes.tsx` → `TOOL_PAGE_REGISTRY` (same `id` as config). Set `lazy: true` only if the page uses `React.lazy` (see `markdown-viewer`).

5. **Routes** — do **not** hand-add `<Route>` in `App.tsx`; `ALL_TOOLS` drives routes via `ToolRoutePage`.

6. **Server API** (only if needed) — update **`server.ts`** and **`api/`** together (dual-server).

7. **Verify** — use [vibe-verify](../vibe-verify/SKILL.md) or run:
   ```bash
   npm run lint
   npm run build
   npm run check:registry
   ```

> 1. 비슷한 기존 도구를 참고  
> 2. `src/pages/tools/{Name}.tsx` 생성 (`fillViewport` 시 flex 레이아웃)  
> 3. `tools-config.ts` — `ALL_TOOLS` + `TOOL_GROUPS`  
> 4. `tool-routes.tsx` — `TOOL_PAGE_REGISTRY` (id 일치)  
> 5. `App.tsx`에 Route 수동 추가 금지  
> 6. API 필요 시 `server.ts` + `api/` 동시 수정  
> 7. `vibe-verify` 또는 lint · build · check:registry  

## Dashboard copy
<!-- 대시보드 카드 문구 -->

| Field | Rule |
|-------|------|
| `title` | 1 line on card (`line-clamp-1`) |
| `description` | 1 line on card (`line-clamp-1`) |
| `routeDescription` | Optional longer header on the tool page |

> | 필드 | 규칙 |
> |------|------|
> | `title` | 카드 제목 1줄 |
> | `description` | 카드 설명 1줄 |
> | `routeDescription` | 도구 페이지 상단 긴 설명(선택) |

## fillViewport peers
<!-- 전체 높이 UI -->

`markdown-viewer`, `emoji-picker`, `free-icons` — use `fillViewport: true` for full-height tools with internal scroll only.

> 위 도구들처럼 **패널 내부만** 스크롤할 때 `fillViewport: true`.

## Do not
<!-- 금지 -->

- Duplicate AGENTS.md into `.cursor/rules/`
- Add one-off `<Route>` blocks in `App.tsx`
- Commit unless the user explicitly asks

> - AGENTS.md를 rules에 복사하지 않기  
> - App.tsx Route 중복 추가 금지  
> - 사용자 요청 없이 commit 금지  
