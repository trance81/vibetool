---
name: vibe-verify
description: >-
  Use after code changes for skeptical verification (lint, build, check:registry).
  Before claiming done or pre-commit. Korean triggers: 확인해줘, 빌드 통과, 제대로 됐는지.
---

# Vibe Dev Tools — Verify (external-style gate)
<!-- 변경 후 검증 — 생성과 평가 분리 -->

Inspired by [Anthropic harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps): treat **lint/build/registry** as a skeptical evaluator, not self-praise.

> [Anthropic 하네스](https://www.anthropic.com/engineering/harness-design-long-running-apps)처럼, “완료” 자기평가 대신 **명령 결과**로 검증합니다.

## When to use
<!-- 사용 시점 -->

- After `vibe-add-tool` or any substantive code change
- User asks “does it work?” / “check before commit”
- Before claiming a task is complete

> 도구 추가·의미 있는 코드 변경 후 · 동작 확인·커밋 전 · 완료 선언 전

## When NOT to use
<!-- 사용하지 않을 때 -->

- Pure documentation Q&A with no code changes
- User only wants an explanation, not verification

> 코드 변경 없는 설명만 · 검증 요청이 아닐 때

## Hard gates (must run and report exit code)
<!-- 필수 게이트 -->

```bash
npm run lint
npm run build
npm run check:registry
```

Do **not** mark the task complete if any command fails. Paste relevant error lines.

> 실패 시 완료 처리 금지 · 에러 출력을 붙여 보고

## Manual checks (UI / tool pages)
<!-- 수동 UI 점검 -->

| Criterion | Pass if |
|-----------|---------|
| **Theme** | Matches dark `@theme` in `src/index.css`; uses Shadcn `components/ui` |
| **Layout** | `fillViewport` tools scroll inside the panel, not the whole window |
| **Copy** | New UI strings in Korean where applicable |
| **Registration** | If a tool changed: ids still match `tools-config` + `tool-routes` |
| **Dual-server** | If API touched: `server.ts` and `api/` behave the same |

> | 항목 | 통과 조건 |
> |------|-----------|
> | 테마 | 다크 @theme · Shadcn |
> | 레이아웃 | fillViewport는 패널 내부 스크롤 |
> | 문구 | UI는 한국어 |
> | 등록 | config ↔ routes id 일치 |
> | API | server.ts ↔ api/ 동일 |

## Skeptical rule
<!-- 회의적 규칙 -->

Assume the first implementation may be wrong. Re-read changed files; do not trust prior assistant messages without command output.

> 첫 구현이 틀릴 수 있다고 가정 · 변경 파일 재확인 · 명령 출력 없이 “됐다”고 하지 않기

## Scale
<!-- 규모 -->

| Mode | Do |
|------|-----|
| **Quick** | `check:registry` + `lint` only |
| **Full** | All three commands + spot-check in browser if UI changed |

> **Quick:** registry + lint · **Full:** 세 명령 + UI 변경 시 브라우저 확인
