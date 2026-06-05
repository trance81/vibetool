# CLAUDE.md
<!-- Claude Code entry point — constitution + harness triggers -->

**Document convention:** English body; `<!-- -->` section labels; Korean in `>` blockquotes (same as AGENTS.md).

> **문서 규칙:** 본문 영문 · `<!-- 섹션 한글 -->` · `>` 블록에 한글 설명 (AGENTS.md와 동일).

## Project instructions
<!-- 프로젝트 지침 -->

Architecture, commands, and coding conventions: **[AGENTS.md](./AGENTS.md)** (shared with Cursor).  
Feature prompt templates: **[PROMPT.md](./PROMPT.md)** — copy before asking for new tools or large changes.

> 아키텍처·규칙: **AGENTS.md** · 기능 추가 프롬프트 복사: **PROMPT.md**

## Agent behavior (read every session)
<!-- 세션마다 읽을 행동 지침 (gpters Obsidian “헌법” 패턴) -->

- Read **[AGENTS.md](./AGENTS.md)** for architecture; do not duplicate it here.
- **Read before edit**; **minimal diff**; one tool/concern per large task when possible.
- If tool `id`, group, or API shape is unclear → **ask the user** (do not guess `tools-config`).
- Run verifiable gates before “done”: `npm run lint`, `npm run build`, `npm run check:registry` when routes/tools changed.
- No `git commit` unless the user asks; no secrets in commits; no destructive git without explicit ask.
- Multi-session stop → optional [docs/agent/HANDOFF.template.md](./docs/agent/HANDOFF.template.md).

> - 아키텍처는 **AGENTS.md**만 따르고 여기에 복사하지 않음  
> - 수정 전 파일 읽기 · 최소 변경 · 큰 작업은 도구/주제 단위로 나누기  
> - `id`·그룹·API 형태가 불명확하면 **사용자에게 확인** (`tools-config` 추측 금지)  
> - 완료 전 `lint` · `build` · (도구/라우트 변경 시) `check:registry` 실행  
> - 사용자 요청 없이 commit 금지 · 비밀/`.env` 커밋 금지 · 파괴적 git 금지  
> - 세션 중단 시 선택: `HANDOFF.template.md` 복사 후 작성  

## Harness: Vibe Dev Tools
<!-- 경량 하네스 -->

**Goal:** Keep tool registration, API dual-server, and agent docs in sync across Claude Code and Cursor.

> **목표:** 도구 등록·API 이중 서버·에이전트 문서가 Claude/Cursor에서 어긋나지 않게 유지.

### Skills — triggers
<!-- 스킬 트리거 -->

| Skill | Use when (examples) | Do NOT use when |
|-------|---------------------|-----------------|
| `vibe-add-tool` | New `/tools/...` page, dashboard card, `tools-config` / `tool-routes` | Docs-only typo; unrelated refactor |
| `vibe-harness-audit` | Harness audit, registry drift, AGENTS vs code mismatch | Single-line bugfix with no registry touch |
| `vibe-dual-server-api` | Edit `server.ts`, `api/`, exchange/shortener proxy | Browser-only tool, no server |
| `vibe-verify` | After implementation, pre-commit check, “verify it works” | Pure Q&A, no code changed |

> | 스킬 | 쓸 때 | 쓰지 말 때 |
> |------|--------|------------|
> | `vibe-add-tool` | 새 도구 페이지·대시보드 카드·등록 | 문서 오타만·무관한 대규모 리팩터 |
> | `vibe-harness-audit` | 하네스 점검·등록 누락·문서 drift | 레지스트리 무관 한 줄 수정 |
> | `vibe-dual-server-api` | `server.ts` / `api/` 수정 | 브라우저 전용 도구 |
> | `vibe-verify` | 구현 후 검증·커밋 전 확인 | 코드 변경 없는 질문만 |

Read `SKILL.md` under `.claude/skills/` (mirror: `.cursor/skills/`).

> 일반 질문·작은 수정은 AGENTS.md만으로 충분. 위 표에 해당하면 스킬을 읽고 진행.

**Layout (do not duplicate full AGENTS.md here):**
<!-- 레이어 구성 -->

| Layer | Path |
|-------|------|
| SSOT (architecture) | [AGENTS.md](./AGENTS.md) |
| Skills (workflows) | `.claude/skills/`, `.cursor/skills/` (keep in sync) |
| Cursor session rules | `.cursor/rules/*.mdc` |
| Structural code | `tools-config.ts`, `tool-routes.tsx`, `App.tsx` |
| Session handoff (optional) | `docs/agent/HANDOFF.template.md` |

> | 레이어 | 경로 |
> |--------|------|
> | 단일 기준 | AGENTS.md |
> | 워크플로 스킬 | `.claude/skills/` · `.cursor/skills/` (동기화) |
> | Cursor 규칙 | `.cursor/rules/` |
> | 구조 코드 | tools-config · tool-routes · App.tsx |
> | 세션 인수인계(선택) | docs/agent/HANDOFF.template.md |

**References:** [harness-100](https://github.com/revfactory/harness-100) (triggers) · [Anthropic long-running harness](https://www.anthropic.com/engineering/harness-design-long-running-apps) (verifiable gates) · [gpters Obsidian KB](https://www.gpters.org/nocode/post/knowledge-base-builder-connecting-jH9PdQQcudtVDc0) (constitution) · [OpenSpace](https://github.com/HKUDS/OpenSpace) (not adopted: cloud self-evolving skills)

> **참고 링크:** harness-100(트리거) · Anthropic(검증 게이트) · gpters(헌법형 CLAUDE.md) · OpenSpace(미도입: 클라우드 자기진화 스킬)

**Change log:**
<!-- 변경 이력 -->

| Date | Change | Target | Reason |
|------|--------|--------|--------|
| 2026-06-02 | Initial lightweight harness (AGENTS + rules + registry routes) | repo | Coding consistency |
| 2026-06-02 | Added vibe-* skills + CLAUDE harness pointer | `.claude/skills`, CLAUDE.md | revfactory-style complement |
| 2026-06-02 | `check:registry`, `vibe-verify`, behavior constitution, HANDOFF template | scripts, docs/agent, skills | External harness references |
| 2026-06-02 | Added PROMPT.md + prompt-cookbook.mdc | PROMPT.md, .cursor/rules | Feature prompt cookbook |
| 2026-06-05 | ERP column lookup + JSON build pipeline + Vercel `includeFiles` | AGENTS.md, PROMPT.md, skills, vercel.json | Server-backed internal tool; CSV→JSON at build |
| 2026-06-05 | Dashboard: 1-line cards, fixed sidebar/footer scroll | ToolCard, Dashboard, ToolLayout | Home layout UX |

> **변경 이력:** 하네스 구조·스킬을 바꿀 때마다 이 표에 한 줄 추가하세요.
