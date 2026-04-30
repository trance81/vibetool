# Vibe Tools 🚀

**Vibe Tools**는 개발자들을 위한 프리미엄 웹 유틸리티 모음 서비스입니다. 세련된 UI와 함께 일상적인 개발 과정에서 자주 필요한 다양한 도구들을 한곳에서 제공합니다.

## ✨ 주요 기능

### 🖼️ 이미지 / 미디어
- **QR 생성기**: 커스텀 디자인과 스타일이 적용된 QR 코드를 생성합니다.
- **이미지 리사이저**: 브라우저 내에서 안전하게 이미지 크기를 조절하고 포맷을 변환합니다.
- **색상 파레트**: 색상을 선택하고 보색 및 유사색 가이드를 제공하며 다양한 형식으로 코드를 복사합니다.

### ✍️ 텍스트 변환
- **이모지 피커**: 특수문자와 이모지를 빠르게 검색하고 클릭 한 번으로 복사합니다.
- **텍스트 케이스**: CamelCase, snake_case, PascalCase 등 다양한 텍스트 케이스 변환을 지원합니다.
- **SQL 포맷터**: 복잡한 SQL 쿼리를 읽기 좋게 정렬합니다.
- **마크다운 테이블**: 시각적인 표 편집기를 통해 마크다운 테이블 코드를 생성합니다.

### 🛠️ 개발 유틸리티
- **패스워드 생성기**: 보안성이 높은 무작위 비밀번호를 즉시 생성합니다.
- **타임스탬프**: Unix 타임스탬프와 사람이 읽을 수 있는 날짜를 상호 변환합니다.
- **크론 표현식**: Cron식을 시각적으로 해석하고 생성합니다.

### 🔗 URL / 북마크
- **단축 URL**: 긴 URL 주소를 짧게 줄여줍니다 (is.gd 연동).
- **URL 북마크**: 개발 시 자주 방문하는 유용한 사이트들을 관리합니다.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Motion (Framer Motion)
- **Components**: Shadcn UI, Radix UI, Lucide React
- **Deployment**: Vercel (Serverless Functions)

## 🚀 로컬 실행 방법

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/trance81/vibetool.git
   cd vibetool
   ```

2. 의존성 패키지를 설치합니다:
   ```bash
   npm install --legacy-peer-deps
   ```

3. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

4. 브라우저에서 `http://localhost:3000` 접속하여 확인합니다.

## 🌐 배포 (Vercel)

이 프로젝트는 Vercel 배포에 최적화되어 있습니다. GitHub 저장소를 Vercel에 연결하면 자동으로 배포됩니다.

- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **API Routes**: `/api/*` 경로의 요청은 `api/` 디렉토리의 서버리스 함수가 처리합니다.

## 🔒 보안 및 개인정보

Vibe Tools의 대부분의 기능(URL 단축 제외)은 **브라우저 로컬 환경**에서 실행됩니다. 입력하신 데이터는 서버로 전송되지 않으며, 사용자의 브라우저 내에서만 안전하게 처리됩니다.

---
Created by [trance81](https://github.com/trance81)
