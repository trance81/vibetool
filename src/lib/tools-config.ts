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
  Bookmark 
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  group: string;
}

export const TOOL_GROUPS = [
  {
    title: "이미지/미디어",
    tools: ["qr-generator", "image-resizer"]
  },
  {
    title: "텍스트 변환",
    tools: ["text-case", "sql-formatter", "markdown-table", "emoji-picker"]
  },
  {
    title: "개발 유틸",
    tools: ["password-generator", "timestamp", "cron"]
  },
  {
    title: "URL/북마크",
    tools: ["url-shortener", "url-bookmark"]
  }
];

export const ALL_TOOLS: Tool[] = [
  {
    id: "qr-generator",
    title: "QR 생성기",
    description: "커스텀 스타일의 QR 코드를 생성합니다.",
    icon: QrCode,
    path: "/tools/qr-generator",
    group: "이미지/미디어"
  },
  {
    id: "image-resizer",
    title: "이미지 리사이저",
    description: "이미지 크기 조절 및 포맷 변환.",
    icon: ImageIcon,
    path: "/tools/image-resizer",
    group: "이미지/미디어"
  },
  {
    id: "emoji-picker",
    title: "이모지 피커",
    description: "특수문자와 이모지를 빠르게 복사합니다.",
    icon: Smile,
    path: "/tools/emoji-picker",
    group: "텍스트 변환"
  },
  {
    id: "text-case",
    title: "텍스트 케이스",
    description: "텍스트의 대소문자를 다양한 케이스로 변환.",
    icon: Type,
    path: "/tools/text-case",
    group: "텍스트 변환"
  },
  {
    id: "sql-formatter",
    title: "SQL 포맷터",
    description: "SQL 쿼리를 깔끔하게 정리합니다.",
    icon: Database,
    path: "/tools/sql-formatter",
    group: "텍스트 변환"
  },
  {
    id: "markdown-table",
    title: "마크다운 테이블",
    description: "마크다운 테이블을 시각적으로 편집.",
    icon: Table,
    path: "/tools/markdown-table",
    group: "텍스트 변환"
  },
  {
    id: "password-generator",
    title: "패스워드 생성기",
    description: "안전한 비밀번호를 무작위로 생성.",
    icon: Key,
    path: "/tools/password-generator",
    group: "개발 유틸"
  },
  {
    id: "timestamp",
    title: "타임스탬프",
    description: "Unix 타임스탬프 양방향 변환.",
    icon: Clock,
    path: "/tools/timestamp",
    group: "개발 유틸"
  },
  {
    id: "cron",
    title: "크론 표현식",
    description: "크론 표현식 해석 및 생성.",
    icon: CalendarClock,
    path: "/tools/cron",
    group: "개발 유틸"
  },
  {
    id: "url-shortener",
    title: "단축 URL",
    description: "긴 URL을 짧게 줄여줍니다.",
    icon: Link,
    path: "/tools/url-shortener",
    group: "URL/북마크"
  },
  {
    id: "url-bookmark",
    title: "URL 북마크",
    description: "자주 쓰는 개발 도구 북마크.",
    icon: Bookmark,
    path: "/tools/url-bookmark",
    group: "URL/북마크"
  }
];
