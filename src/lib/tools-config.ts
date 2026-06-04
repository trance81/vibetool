import { 
  QrCode, 
  ImageIcon, 
  Smile, 
  Link, 
  Type, 
  Key, 
  Clock, 
  CalendarClock, 
  Table, 
  Database, 
  Bookmark,
  Palette,
  CircleDollarSign,
  FileText,
  Shapes,
  TableProperties,
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  /** Dashboard ToolCard copy (up to 4 lines; 2-line slot centered when shorter) */
  description: string;
  /** Tool page header; defaults to description */
  routeDescription?: string;
  icon: any;
  path: string;
  group: string;
  /** Full-height tool UI; scroll inside panes (see ToolLayout fillViewport) */
  fillViewport?: boolean;
}

export const TOOL_GROUPS = [
  {
    title: "이미지/미디어",
    tools: ["qr-generator", "image-resizer", "color-palette", "free-icons"]
  },
  {
    title: "텍스트 변환",
    tools: ["text-case", "sql-formatter", "markdown-table", "markdown-viewer", "emoji-picker"]
  },
  {
    title: "개발 유틸",
    tools: ["password-generator", "timestamp", "cron", "erp-column-lookup"]
  },
  {
    title: "URL/북마크",
    tools: ["url-shortener", "url-bookmark"]
  },
  {
    title: "일상 유틸",
    tools: ["currency-converter"]
  }
];

export const ALL_TOOLS: Tool[] = [
  {
    id: "qr-generator",
    title: "QR 생성기",
    description: "커스텀 QR 코드 생성",
    routeDescription: "커스텀 디자인의 QR 코드를 생성합니다.",
    icon: QrCode,
    path: "/tools/qr-generator",
    group: "이미지/미디어",
  },
  {
    id: "image-resizer",
    title: "이미지 리사이저",
    description: "크기·포맷 변환",
    icon: ImageIcon,
    path: "/tools/image-resizer",
    group: "이미지/미디어"
  },
  {
    id: "color-palette",
    title: "색상 파레트",
    description: "색상·테마 선택",
    icon: Palette,
    path: "/tools/color-palette",
    group: "이미지/미디어"
  },
  {
    id: "free-icons",
    title: "아이콘 피커",
    description: "7종 라이브러리 탐색·SVG·ICO",
    routeDescription:
      "아이콘 라이브러리를 탐색하고 SVG·ICO로 다운로드합니다.",
    icon: Shapes,
    path: "/tools/free-icons",
    group: "이미지/미디어",
    fillViewport: true,
  },
  {
    id: "emoji-picker",
    title: "이모지 피커",
    description: "특수문자·이모지 검색·복사",
    routeDescription: "특수문자·이모지 탭으로 검색하고 복사합니다.",
    icon: Smile,
    path: "/tools/emoji-picker",
    group: "텍스트 변환",
    fillViewport: true,
  },
  {
    id: "text-case",
    title: "텍스트 케이스",
    description: "대소문자 케이스 변환",
    routeDescription: "다양한 케이스로 변환합니다.",
    icon: Type,
    path: "/tools/text-case",
    group: "텍스트 변환",
  },
  {
    id: "sql-formatter",
    title: "SQL 포맷터",
    description: "SQL 정렬·포맷",
    icon: Database,
    path: "/tools/sql-formatter",
    group: "텍스트 변환"
  },
  {
    id: "markdown-table",
    title: "마크다운 테이블",
    description: "표 시각 편집",
    icon: Table,
    path: "/tools/markdown-table",
    group: "텍스트 변환"
  },
  {
    id: "markdown-viewer",
    title: "마크다운 뷰어",
    description: "작성·미리보기·Mermaid",
    routeDescription:
      "마크다운을 작성하고 표·다이어그램 미리보기를 확인합니다.",
    icon: FileText,
    path: "/tools/markdown-viewer",
    group: "텍스트 변환",
    fillViewport: true,
  },
  {
    id: "password-generator",
    title: "패스워드 생성기",
    description: "강력한 비밀번호 생성",
    routeDescription: "보안성이 높은 무작위 비밀번호를 생성합니다.",
    icon: Key,
    path: "/tools/password-generator",
    group: "개발 유틸",
  },
  {
    id: "timestamp",
    title: "타임스탬프",
    description: "Unix↔날짜 변환",
    icon: Clock,
    path: "/tools/timestamp",
    group: "개발 유틸"
  },
  {
    id: "cron",
    title: "크론 표현식",
    description: "크론식 해석·생성",
    icon: CalendarClock,
    path: "/tools/cron",
    group: "개발 유틸"
  },
  {
    id: "erp-column-lookup",
    title: "ERP 컬럼 조회",
    description: "테이블·컬럼 검색 (PIN)",
    routeDescription:
      "ERP 컬럼 CSV 기준으로 테이블·컬럼을 검색합니다. 내부용 PIN 필요.",
    icon: TableProperties,
    path: "/tools/erp-column-lookup",
    group: "개발 유틸",
    fillViewport: true,
  },
  {
    id: "url-shortener",
    title: "단축 URL",
    description: "URL 단축",
    icon: Link,
    path: "/tools/url-shortener",
    group: "URL/북마크"
  },
  {
    id: "url-bookmark",
    title: "URL 북마크",
    description: "개발 도구 북마크",
    icon: Bookmark,
    path: "/tools/url-bookmark",
    group: "URL/북마크"
  },
  {
    id: "currency-converter",
    title: "환율 계산기",
    description: "실시간 환율 변환",
    icon: CircleDollarSign,
    path: "/tools/currency-converter",
    group: "일상 유틸"
  }
];
