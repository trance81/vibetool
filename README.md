# Vibe Tools
<!-- Developer web utilities collection — human-facing README -->

Premium web utilities for developers. Most tools run **only in the browser**.

> 개발자용 웹 유틸리티 모음. 대부분의 도구는 **브라우저에서만** 동작합니다.

## Run locally
<!-- 로컬 실행 -->

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> 브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## Tool list
<!-- 도구 목록 -->

All tools appear on the app **dashboard**. Canonical list: `src/lib/tools-config.ts`.

> 앱 **대시보드**에 전체 도구가 표시됩니다. 단일 목록: `src/lib/tools-config.ts`.

## Tech stack
<!-- 기술 스택 -->

- React 19, TypeScript, Vite
- Tailwind CSS v4, Shadcn UI
- Vercel (SPA + serverless `api/`)

> React 19 · TypeScript · Vite · Tailwind v4 · Shadcn · Vercel(SPA + `api/`)

## Deploy (Vercel)
<!-- 배포 -->

- **Build**: `vite build`
- **Output**: `dist`
- **API**: `/api/*` → `api/` directory

> 빌드 `vite build` · 출력 `dist` · API는 `api/` 디렉터리

## AI / contributors
<!-- AI·기여자 -->

- **Rules (SSOT):** [AGENTS.md](./AGENTS.md)
- **Prompt templates:** [PROMPT.md](./PROMPT.md) — copy before feature requests (`@PROMPT.md` in Cursor)
- **Claude Code:** [CLAUDE.md](./CLAUDE.md) — harness triggers and changelog
- **Cursor:** `.cursor/rules/` + `.cursor/skills/` (`vibe-add-tool`, `vibe-harness-audit`, `vibe-dual-server-api`, `vibe-verify`)
- **Verify:** `npm run check:registry` — tool id registry sync
- **Claude skills:** `.claude/skills/` (keep in sync with Cursor skills)

> - 규칙 본문: **AGENTS.md** · 프롬프트 템플릿: **PROMPT.md** (`@PROMPT.md`)  
> - Claude 진입: **CLAUDE.md** (하네스 트리거·변경 이력)  
> - Cursor: `.cursor/rules/` + `.cursor/skills/`  
> - 검증: `npm run check:registry`  
> - Claude 스킬은 Cursor와 동기화  

Coding harness: AGENTS.md + optional vibe-* skills. Not a multi-agent team setup.

> 코딩 하네스(경량). 멀티 에이전트 팀 구성은 아닙니다.

## Privacy
<!-- 개인정보 -->

Only URL shortener and currency converter use server proxies. Other data stays in the client.

> URL 단축·환율만 서버 프록시. 그 외는 클라이언트에서 처리.

---
Created by [trance81](https://github.com/trance81)
