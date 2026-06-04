---
name: vibe-verify
description: >-
  Post-change verification (lint, build, check:registry). See .cursor/skills/vibe-verify.
  Korean triggers: 확인해줘, 빌드 통과, 제대로 됐는지.
---

# Vibe Dev Tools — Verify
<!-- Claude Code용 포인터 -->

Canonical steps: `.cursor/skills/vibe-verify/SKILL.md` (keep in sync).

> 상세: `.cursor/skills/vibe-verify/SKILL.md`

```bash
npm run lint
npm run build
npm run check:registry
```

Do not mark done without exit code 0. See [AGENTS.md](../../../AGENTS.md) verifiable gates.

> exit code 0 없이 완료 금지 · AGENTS.md « Verifiable gates » 참고
