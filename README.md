# Vibe Tools
<!-- Developer web utilities collection -->

개발자용 웹 유틸리티 모음. 대부분의 도구는 **브라우저에서만** 동작합니다.

> Premium web utilities for developers. Most tools run **only in the browser**.

## 실행
<!-- Run locally -->

```bash
npm install --legacy-peer-deps
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

> Open [http://localhost:3000](http://localhost:3000) in your browser.

## 도구 목록
<!-- Tool list -->

앱 **대시보드**에 등록된 전체 도구가 표시됩니다. (단일 목록은 `src/lib/tools-config.ts`에서 관리합니다.)

> All tools appear on the app **dashboard**. Canonical list: `src/lib/tools-config.ts`.

## Tech Stack
<!-- Technology stack -->

- React 19, TypeScript, Vite
- Tailwind CSS v4, Shadcn UI
- Vercel (SPA + `api/` 서버리스)

> Deployed as SPA on Vercel with serverless `api/` routes.

## 배포 (Vercel)
<!-- Deploy on Vercel -->

- **Build**: `vite build`
- **Output**: `dist`
- **API**: `/api/*` → `api/` 디렉터리

> Build with `vite build`, output `dist`, API handlers under `api/`.

## AI / 기여자
<!-- AI agents & contributors -->

에이전트·코딩 규칙은 **[AGENTS.md](./AGENTS.md)** (Claude Code는 [CLAUDE.md](./CLAUDE.md)에서 동일 파일을 참조합니다).

> Coding rules for AI: **[AGENTS.md](./AGENTS.md)**. Claude Code entry: [CLAUDE.md](./CLAUDE.md).

## 개인정보
<!-- Privacy -->

URL 단축·환율 등 일부 기능만 서버 프록시를 사용합니다. 그 외 입력 데이터는 기본적으로 클라이언트에서만 처리됩니다.

> Only URL shortener and currency converter use server proxies. Other data stays in the client.

---
Created by [trance81](https://github.com/trance81)
