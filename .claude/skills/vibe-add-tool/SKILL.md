---
name: vibe-add-tool
description: >-
  Use when adding or registering a new web tool in Vibe Dev Tools. Same as
  .cursor/skills/vibe-add-tool. Korean triggers: 도구 추가, 툴 만들기, 새 기능 페이지.
---

# Vibe Dev Tools — Add Tool
<!-- Claude Code용 요약 — 본문은 .cursor 쪽이 SSOT -->

Read **[AGENTS.md](../../../AGENTS.md)** first. Canonical steps: `.cursor/skills/vibe-add-tool/SKILL.md` (keep both in sync if you edit one).

> **AGENTS.md** 먼저 · 상세 단계는 `.cursor/skills/vibe-add-tool/SKILL.md` (수정 시 양쪽 동기화)

## Workflow (short)
<!-- 요약 순서 -->

1. Reference: `src/pages/tools/{SimilarTool}.tsx`
2. `src/pages/tools/{Name}.tsx`
3. `src/lib/tools-config.ts` — `ALL_TOOLS` + `TOOL_GROUPS`
4. `src/lib/tool-routes.tsx` — `TOOL_PAGE_REGISTRY`
5. Do not add manual routes in `App.tsx`
6. API: `server.ts` + `api/` together if needed
7. `npm run lint` && `npm run build` && `npm run check:registry` (or `vibe-verify`)

> 참고 도구 → 페이지 → config → routes → App 수동 Route 금지 → API 양쪽 → 검증

Dashboard: title 2-line slot, description 4-line slot (`ToolCard.tsx`).  
`fillViewport: true` for full-height tools (see `emoji-picker`, `free-icons`, `markdown-viewer`).

> 카드: title 2줄 · description 4줄 · 전체 높이 UI는 fillViewport
