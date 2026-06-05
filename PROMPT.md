# PROMPT.md
<!-- 기능 추가·수정 시 복사용 프롬프트 (한글 템플릿) -->

아래 **한글 블록만** 복사해서 `[ ]` 부분만 채운 뒤내면 됩니다.  
에이전트는 한국어 지시를 이해하고, [AGENTS.md](./AGENTS.md) 규칙을 따릅니다.

> Cursor: 맨 위에 `@PROMPT.md` `@AGENTS.md` 를 붙이면 더 안정적입니다.  
> Claude: 프롬프트 맨 위에 `AGENTS.md와 PROMPT.md를 읽고 진행해줘.` 한 줄을 넣어도 됩니다.

---

## 전송 전 (3가지만 확인)
<!-- 체크 -->

1. **한 번에 하나** — 새 도구 하나, 또는 기존 도구 수정 하나  
2. **참고 도구 파일** — `src/pages/tools/○○.tsx` 경로를 적었는지  
3. **커밋** — 원할 때만 “커밋해줘”라고 쓰기 (기본은 커밋 안 함)

---

## Cursor용 템플릿
<!-- @ 로 파일 첨부 가능 -->

### ① 새 웹 도구 추가

```
@PROMPT.md @AGENTS.md

[추가할 기능을 한 줄로]

위 기능을 새 대시보드 도구로 만들어줘. AGENTS.md와 vibe-add-tool 체크리스트를 따라줘.

참고 UI: @src/pages/tools/[비슷한도구].tsx
전체 화면 높이 패널(내부 스크롤): [예 / 아니오 / 참고와 같음]
도구 id: [영문-케밥] / 그룹: [예: 이미지/미디어]

UI 문구는 한국어. 다크 테마·Shadcn 유지.
끝나면 lint, build, check:registry 실행하고 결과 알려줘. 커밋은 하지 마.
```

### ② 기존 도구만 수정

```
@PROMPT.md @AGENTS.md @src/pages/tools/[도구파일].tsx

[바꿀 내용]

이 파일만 최소한으로 수정해줘. tools-config, tool-routes, App.tsx 라우트는 건드리지 마.
lint, build 확인 후 알려줘. 커밋 금지.
```

### ③ 서버 API 수정 (로컬 + Vercel)

```
@PROMPT.md @AGENTS.md @server.ts @api/[해당파일]

[API에서 바꿀 내용]

server.ts와 api/ 폴더를 같은 동작으로 같이 수정해줘.
lint, build 확인. 커밋 금지.
```

### ④ ERP 컬럼 CSV 갱신

```
@PROMPT.md @AGENTS.md @lib/erp-column-service.ts @scripts/build-erp-json.mjs

src/Files/에 새 ERP_컬럼정보_*.csv를 추가했어.

build:erp-json으로 JSON을 갱신하고, API·UI가 새 데이터를 쓰는지 확인해줘.
server.ts와 api/erp-columns/ 동작이 같아야 해. vercel.json includeFiles도 확인.
lint, build, check:registry 실행. 커밋 금지.
```

---

## Claude Code용 템플릿
<!-- 경로는 @ 없이 텍스트로 적어도 됨 -->

### ① 새 웹 도구 추가

```
AGENTS.md, PROMPT.md, vibe-add-tool 스킬을 읽고 진행해줘.

[추가할 기능을 한 줄로]

새 대시보드 도구로 만들어줘.

참고: src/pages/tools/[비슷한도구].tsx
전체 화면 높이 패널: [예 / 아니오 / 참고와 같음]
도구 id: [영문-케밥] / 그룹: [예: 이미지/미디어]

UI 문구 한국어. 다크 테마·Shadcn.
끝나면 npm run lint, npm run build, npm run check:registry 하고 결과 알려줘. 커밋하지 마.
```

### ② 기존 도구만 수정

```
AGENTS.md를 읽고 진행해줘.

[바꿀 내용]

수정 파일: src/pages/tools/[도구파일].tsx 만. 등록 파일·App.tsx 라우트는 변경하지 마.
lint, build 확인. 커밋하지 마.
```

### ③ 서버 API 수정 (로컬 + Vercel)

```
AGENTS.md, vibe-dual-server-api 스킬을 읽고 진행해줘.

[API에서 바꿀 내용]

server.ts와 api/ 를 같은 동작으로 같이 수정해줘.
lint, build 확인. 커밋하지 마.
```

### ④ ERP 컬럼 CSV 갱신

```
AGENTS.md, vibe-dual-server-api 스킬을 읽고 진행해줘.

src/Files/에 새 ERP_컬럼정보_*.csv를 추가했어.

build:erp-json으로 JSON 갱신, API·UI 확인. server.ts와 api/erp-columns/ 동기화.
vercel.json includeFiles 확인. lint, build, check:registry. 커밋하지 마.
```

---

## 짧은 참고
<!-- 참고 도구 · fillViewport · 프롬프트 한 줄 -->

### 어떤 도구를 참고할까?

| 만들 UI | 참고 파일 (Cursor는 `@` 붙이기) | 전체 화면 패널 |
|---------|--------------------------------|----------------|
| **입력 → 결과** (기본·추천) | `src/pages/tools/TextCase.tsx` | 아니오 |
| 상단 옵션 + 텍스트 영역 | `src/pages/tools/SqlFormatter.tsx` | 아니오 |
| 설정(스위치 등) + 생성 결과 | `src/pages/tools/PasswordGenerator.tsx` | 아니오 |
| 입력 + 실시간 미리보기 | `src/pages/tools/QrGenerator.tsx` | 아니오 |
| **좌측 카테고리 + 그리드** (스크롤은 안쪽) | `src/pages/tools/EmojiPicker.tsx` | **예** |
| 편집 + 미리보기 분할 | `src/pages/tools/MarkdownViewer.tsx` | **예** |
| 아이콘 검색·그리드·다운로드 (무거움) | `src/pages/tools/FreeIcons.tsx` | **예** |
| 서버 검색 + PIN + 테이블 다이얼로그 | `src/pages/tools/ErpColumnLookup.tsx` | **예** |

> **처음 새 도구**면 대부분 `TextCase.tsx` + `전체 화면 높이 패널: 아니오`  
> **화면 꽉 채우는 패널**이면 `EmojiPicker.tsx` + `예` (레이아웃만 참고, 데이터 로직은 복사 X)  
> **서버 API + 대용량 데이터**면 `ErpColumnLookup.tsx` + `vibe-dual-server-api` + `build:erp-json` 패턴 참고

### 프롬프트에 붙일 한 줄

| 상황 | 예시 |
|------|------|
| 일반 폼 | `참고: @src/pages/tools/TextCase.tsx` / `전체 화면 높이 패널: 아니오` |
| 전체 높이 UI | `참고: @src/pages/tools/EmojiPicker.tsx` / `전체 화면 높이 패널: 예` |
| 구현 후 검증 | `lint, build, check:registry 확인해줘` |
| 등록 점검 | `하네스 점검해줘. check:registry 포함` |
| ERP CSV 교체 | `build:erp-json 실행하고 ERP API 확인해줘` |

**자동 적용:** 채팅에 문장을 매번 넣어 주지는 않습니다. Cursor는 `@PROMPT.md` `@AGENTS.md` + 위 템플릿 복사가 가장 확실합니다.

---

## 더 보려면

- 규칙 상세: [AGENTS.md](./AGENTS.md)  
- Claude 트리거: [CLAUDE.md](./CLAUDE.md)
