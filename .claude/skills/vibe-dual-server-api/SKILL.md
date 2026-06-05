---
name: vibe-dual-server-api
description: >-
  Use when editing server.ts or api/ (exchange, URL shortener, ERP columns,
  Express routes, Vercel serverless). Keep local and production API in sync.
  Korean triggers: server.ts, api 수정, 환율, URL 단축, ERP 컬럼, build:erp-json.
---

# Vibe Dev Tools — Dual-Server API
<!-- 로컬·Vercel API 동시 반영 -->

## Rule
<!-- 규칙 -->

Any API behavior change must be applied in **both**:

| Environment | Location |
|-------------|----------|
| Local dev | `server.ts`, helpers under `lib/` (e.g. `lib/exchange-service.ts`, `lib/erp-column-service.ts`) |
| Vercel | Matching handler under `api/`, plus **`vercel.json`** when ERP data files or function limits change |

> API 동작 변경은 **항상 양쪽**에 반영: 로컬 `server.ts`(+ lib) · 배포 `api/` · (ERP 시) `vercel.json`

## Workflow
<!-- 순서 -->

1. Read existing implementation in **both** places before editing.
2. Apply the same contract (paths, query params, response shape, errors).
3. Run `npm run dev` and smoke-test locally if possible.
4. Run `npm run lint` and `npm run build` (build runs `build:erp-json` for ERP data).

> 1. 양쪽 기존 코드 먼저 읽기  
> 2. 경로·쿼리·응답·에러 형태 동일하게  
> 3. 가능하면 `npm run dev`로 로컬 확인  
> 4. lint · build (`build`가 ERP JSON도 생성)

## ERP column API
<!-- ERP 컬럼 API -->

| Route | Purpose |
|-------|---------|
| `GET /api/erp-columns/meta` | Dataset version, row count, modules |
| `GET /api/erp-columns/modules` | Module codes only |
| `GET /api/erp-columns/search?q=&modules=&limit=` | Column/table search |
| `GET /api/erp-columns/table?tableId=` | Table definition rows |

**Data pipeline:** Source CSV in `src/Files/ERP_컬럼정보_*.csv` → `npm run build:erp-json` → `ERP_컬럼정보_{ts}.json` + `.meta.json`. Runtime reads JSON via `lib/erp-column-service.ts` (not CSV).

**Vercel:** `vercel.json` must include `includeFiles: "src/Files/**"` on `api/erp-columns/*.ts`. JSON is generated during `npm run build` on deploy.

**CSV update:** Add new CSV → run `build:erp-json` (or `dev`/`build`) → verify APIs. Commit CSV; generated JSON is gitignored.

> - 원본 CSV만 git · JSON은 빌드 시 생성  
> - Vercel은 `vercel.json`으로 `src/Files/**`를 함수에 포함  
> - CSV 교체 후 `build:erp-json` 필수

## Details
<!-- 상세 -->

See [AGENTS.md](../../../AGENTS.md) — Architecture → Dual-server model, ERP column lookup.

> 상세는 AGENTS.md « Dual-server model », « ERP column lookup » 참고

## Privacy note
<!-- 개인정보 -->

Most tools are browser-only. Server APIs today: URL shortener (is.gd), currency converter (exchange rate proxies), ERP column lookup (bundled JSON; PIN verified in browser).

> 대부분 브라우저 전용. 서버: URL 단축 · 환율 프록시 · ERP 컬럼(JSON 읽기, PIN은 클라이언트)
