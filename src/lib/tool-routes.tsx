import { lazy, type ComponentType } from "react";
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
import { ColorPalette } from "@/src/pages/tools/ColorPalette";
import { FreeIcons } from "@/src/pages/tools/FreeIcons";
import { CurrencyConverter } from "@/src/pages/tools/CurrencyConverter";
const MarkdownViewer = lazy(() =>
  import("@/src/pages/tools/MarkdownViewer").then((m) => ({
    default: m.MarkdownViewer,
  }))
);

export type ToolPageEntry = {
  Component: ComponentType;
  lazy?: boolean;
};

/** Map tool id → page component. Keep in sync with ALL_TOOLS in tools-config.ts */
export const TOOL_PAGE_REGISTRY: Record<string, ToolPageEntry> = {
  "text-case": { Component: TextCase },
  "password-generator": { Component: PasswordGenerator },
  timestamp: { Component: TimestampConverter },
  cron: { Component: CronExpression },
  "sql-formatter": { Component: SqlFormatter },
  "markdown-table": { Component: MarkdownTable },
  "markdown-viewer": { Component: MarkdownViewer, lazy: true },
  "emoji-picker": { Component: EmojiPicker },
  "qr-generator": { Component: QrGenerator },
  "image-resizer": { Component: ImageResizer },
  "url-shortener": { Component: UrlShortener },
  "url-bookmark": { Component: UrlBookmark },
  "color-palette": { Component: ColorPalette },
  "free-icons": { Component: FreeIcons },
  "currency-converter": { Component: CurrencyConverter },
};
