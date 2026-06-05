---
name: vibe-dual-server-api
description: >-
  Use when editing server.ts or api/ (exchange, URL shortener, Express routes,
  Vercel serverless). Keep local and production API in sync. Korean triggers:
  server.ts, api 수정, 환율, URL 단축.
---

# Vibe Dev Tools — Dual-Server API
<!-- 로컬·Vercel API 동시 반영 -->

## Rule
<!-- 규칙 -->

Any API behavior change must be applied in **both**:

| Environment | Location |
|-------------|----------|
| Local dev | `server.ts`, helpers under `lib/` (e.g. `lib/exchange-service.ts`) |
| Vercel | Matching handler under `api/` |

> API 동작 변경은 **항상 양쪽**에 반영: 로컬 `server.ts`(+ lib) · 배포 `api/`

## Workflow
<!-- 순서 -->

1. Read existing implementation in **both** places before editing.
2. Apply the same contract (paths, query params, response shape, errors).
3. Run `npm run dev` and smoke-test locally if possible.
4. Run `npm run lint` and `npm run build`.

> 1. 양쪽 기존 코드 먼저 읽기  
> 2. 경로·쿼리·응답·에러 형태 동일하게  
> 3. 가능하면 `npm run dev`로 로컬 확인  
> 4. lint · build  

## Details
<!-- 상세 -->

See [AGENTS.md](../../../AGENTS.md) — Architecture → Dual-server model.

> 상세는 AGENTS.md « Dual-server model » 참고

## Privacy note
<!-- 개인정보 -->

Most tools are browser-only. Server APIs today: URL shortener (is.gd), currency converter (exchange rate proxies).

> 대부분 브라우저 전용. 서버: URL 단축(is.gd)·환율 프록시만
