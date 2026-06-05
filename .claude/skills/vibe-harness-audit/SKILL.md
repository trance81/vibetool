---
name: vibe-harness-audit
description: >-
  Harness audit and registry drift. Read .cursor/skills/vibe-harness-audit/SKILL.md.
  Korean triggers: 하네스 점검, 하네스 감사, 등록 누락.
---

# Vibe Dev Tools — Harness Audit
<!-- Claude Code용 포인터 -->

Read checklist in `.cursor/skills/vibe-harness-audit/SKILL.md` (source of truth; update both if changed).

> 체크리스트 본문: `.cursor/skills/vibe-harness-audit/SKILL.md` (양쪽 동기화)

Summarize findings in **Korean** for the user: OK / drift / fix per file.

> 결과는 사용자에게 **한국어**로 요약

Verify: `ALL_TOOLS` ids ↔ `TOOL_PAGE_REGISTRY`, `TOOL_GROUPS`, dual-server parity, CLAUDE.md changelog, no AGENTS duplication in rules.

> config↔routes↔groups · 이중 서버 · CLAUDE 이력 · rules에 AGENTS 전문 복사 없음

After code fixes: `npm run lint` && `npm run build` && `npm run check:registry`.

> 코드 수정 후 lint · build · check:registry
