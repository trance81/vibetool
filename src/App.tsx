import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolLayout } from "@/src/components/ToolLayout";
import { Dashboard } from "@/src/pages/Dashboard";
import { TextCase } from "@/src/pages/tools/TextCase";
import { PasswordGenerator } from "@/src/pages/tools/PasswordGenerator";
import { TimestampConverter } from "@/src/pages/tools/TimestampConverter";
import { CronExpression } from "@/src/pages/tools/CronExpression";
import { SqlFormatter } from "@/src/pages/tools/SqlFormatter";
import { MarkdownTable } from "@/src/pages/tools/MarkdownTable";
import { EmojiPicker } from "@/src/pages/tools/EmojiPicker";
import { QrGenerator } from "@/src/pages/tools/QrGenerator";
import { ImageResizer } from "@/src/pages/tools/ImageResizer";
import { UrlShortener } from "@/src/pages/tools/UrlShortener";
import { UrlBookmark } from "@/src/pages/tools/UrlBookmark";

export default function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ToolLayout title="Dashboard"><Dashboard /></ToolLayout>} />
          
          <Route path="/tools/text-case" element={<ToolLayout title="텍스트 케이스" description="다양한 케이스로 변환합니다."><TextCase /></ToolLayout>} />
          <Route path="/tools/password-generator" element={<ToolLayout title="패스워드 생성기" description="보안성이 높은 무작위 비밀번호를 생성합니다."><PasswordGenerator /></ToolLayout>} />
          <Route path="/tools/timestamp" element={<ToolLayout title="타임스탬프" description="Unix 타임스탬프와 날짜를 상호 변환합니다."><TimestampConverter /></ToolLayout>} />
          <Route path="/tools/cron" element={<ToolLayout title="크론 표현식" description="크론식을 해석하고 생성합니다."><CronExpression /></ToolLayout>} />
          <Route path="/tools/sql-formatter" element={<ToolLayout title="SQL 포맷터" description="SQL 쿼리를 읽기 좋게 정렬합니다."><SqlFormatter /></ToolLayout>} />
          <Route path="/tools/markdown-table" element={<ToolLayout title="마크다운 테이블" description="시각적인 표 편집기로 마크다운 테이블을 만듭니다."><MarkdownTable /></ToolLayout>} />
          <Route path="/tools/emoji-picker" element={<ToolLayout title="이모지 피커" description="특수문자와 이모지를 빠르게 검색하고 복사합니다."><EmojiPicker /></ToolLayout>} />
          <Route path="/tools/qr-generator" element={<ToolLayout title="QR 생성기" description="커스텀 디자인의 QR 코드를 생성합니다."><QrGenerator /></ToolLayout>} />
          <Route path="/tools/image-resizer" element={<ToolLayout title="이미지 리사이저" description="브라우저 내에서 안전하게 이미지를 처리합니다."><ImageResizer /></ToolLayout>} />
          <Route path="/tools/url-shortener" element={<ToolLayout title="단축 URL" description="긴 주소를 짧게 줄입니다."><UrlShortener /></ToolLayout>} />
          <Route path="/tools/url-bookmark" element={<ToolLayout title="URL 북마크" description="개발 시 자주 사용하는 유용한 링크들입니다."><UrlBookmark /></ToolLayout>} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
