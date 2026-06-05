---
name: vibe-harness-audit
description: >-
  Use for harness audit, registry drift, or AGENTS.md vs code mismatch (tools-config
  vs tool-routes, README vs dashboard). Korean triggers: 하네스 점검, 하네스 감사,
  도구 등록 누락.
---

# Vibe Dev Tools — Harness Audit
<!-- 하네스·레지스트리·문서 동기화 점검 -->

Lightweight harness for this repo (not a multi-agent team). Compare **code registry** vs **docs** vs **Cursor rules**.

> 멀티 에이전트 팀이 아닌 **경량 하네스**입니다. 코드 레지스트리·문서·Cursor rules를 대조합니다.

## When to use
<!-- 사용 시점 -->

- User asks for harness audit or “registration missing”
- Suspected drift between `tools-config` and `tool-routes`
- After large harness/doc changes

> 하네스 점검·등록 누락 의심·대규모 문서/하네스 변경 후

## When NOT to use
<!-- 사용하지 않을 때 -->

- Single-file fix with no `tools-config` / `tool-routes` / AGENTS touch
- User wants feature work, not an audit — use `vibe-add-tool` instead

> 레지스트리/AGENTS 무관 한 줄 수정 · 기능 구현 요청(→ `vibe-add-tool`)

## Automated check (run first)
<!-- 자동 검사 -->

```bash
npm run check:registry
```

> 먼저 `npm run check:registry`를 실행합니다.

## Checklist
<!-- 체크리스트 -->

### 1. Tool registry sync
<!-- 도구 레지스트리 -->

| Source | What to check |
|--------|----------------|
| `src/lib/tools-config.ts` | Every `ALL_TOOLS[].id` |
| `src/lib/tool-routes.tsx` | `TOOL_PAGE_REGISTRY` keys must match **exactly** |
| `TOOL_GROUPS` | Every listed `id` exists in `ALL_TOOLS` |
| `src/App.tsx` | Routes generated from `ALL_TOOLS` only (no orphan manual routes) |

Report: missing keys, orphan keys, path duplicates.

> config의 id ↔ routes 키 ↔ groups · App.tsx 수동 Route 없음 · 누락/고아/경로 중복 보고

### 2. fillViewport consistency
<!-- fillViewport -->

Tools with full-height UI should have `fillViewport: true` in `tools-config` and match peers (`emoji-picker`, `free-icons`, `markdown-viewer`, `erp-column-lookup`).

> 전체 높이 UI는 `fillViewport: true` 및 동료 도구와 패턴 일치

### 3. Dual-server API
<!-- 이중 서버 -->

If `server.ts` exposes a route, the same behavior must exist under `api/`. ERP routes need `build:erp-json` + `vercel.json` `includeFiles`. See [AGENTS.md](../../../AGENTS.md) dual-server and ERP sections.

> `server.ts`에 있으면 `api/`에도 동일 동작

### 4. Documentation drift
<!-- 문서 drift -->

| Doc | Role |
|-----|------|
| [AGENTS.md](../../../AGENTS.md) | SSOT for agents — update when patterns change |
| [CLAUDE.md](../../../CLAUDE.md) | Harness triggers + changelog only (no full duplicate of AGENTS) |
| [README.md](../../../README.md) | Human-facing; tool list points to dashboard / `tools-config` |
| `.cursor/rules/*.mdc` | Cursor-only; must **not** paste full AGENTS body |

> AGENTS=본문 · CLAUDE=트리거+이력 · README=사람용 · rules=AGENTS 전문 복사 금지

### 5. Skills & rules
<!-- 스킬·규칙 -->

- `.cursor/skills/vibe-add-tool` — add-tool workflow
- `.cursor/skills/vibe-verify` — post-change gates
- `.claude/skills/` — Claude Code copies (keep in sync with `.cursor/skills/`)
- `project-core.mdc` → points to AGENTS.md

> Cursor/Claude 스킬 동기화 · project-core는 AGENTS 링크

## Output format
<!-- 결과 보고 형식 -->

Summarize in **Korean** for the user:

1. **OK** items (brief)
2. **Drift / fixes** — file path + concrete action
3. **Suggested AGENTS.md or CLAUDE.md changelog row** if harness behavior changed

> 사용자에게 **한국어**로: OK 요약 · drift(파일+조치) · 하네스 변경 시 changelog 제안

## After fixes
<!-- 수정 후 -->

Run `npm run lint`, `npm run build`, and `npm run check:registry` when code was touched.

> 코드를 고쳤으면 lint · build · check:registry 실행
