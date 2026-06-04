import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, FileText, Maximize2, Minimize2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/src/components/MarkdownPreview";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vibe-tools:markdown-viewer:draft";

const PANE_FRAME =
  "flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card/30";
const TEXTAREA_CLASS =
  "field-sizing-fixed h-full min-h-0 w-full flex-1 resize-none overflow-y-auto rounded-lg font-mono text-sm";
const PREVIEW_SCROLL = "h-full min-h-0 overflow-y-auto overscroll-y-contain p-4";

const EXAMPLE_MARKDOWN = `# 문서 제목

일반 텍스트와 **굵게**, *기울임*을 지원합니다.

| 기능 | 지원 |
|------|:----:|
| GFM 표 | O |
| Mermaid | O |

\`\`\`mermaid
flowchart LR
  Edit[편집] --> Preview[미리보기]
\`\`\`

\`\`\`mermaid
sequenceDiagram
  participant U as 사용자
  participant V as 뷰어
  U->>V: 마크다운 입력
  V-->>U: 미리보기 표시
\`\`\`

- 목록 항목 1
- 목록 항목 2

> 인용문 블록도 지원합니다.
`;

function loadDraft(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function EditorPane({
  id,
  markdown,
  onChange,
  className,
}: {
  id: string;
  markdown: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn(PANE_FRAME, className)}>
      <Label htmlFor={id} className="sr-only">
        마크다운 입력
      </Label>
      <Textarea
        id={id}
        placeholder="마크다운을 입력하세요..."
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        className={TEXTAREA_CLASS}
      />
    </div>
  );
}

function PreviewPane({
  markdown,
  className,
  onFullscreen,
}: {
  markdown: string;
  className?: string;
  onFullscreen?: () => void;
}) {
  return (
    <div className={cn(PANE_FRAME, className)}>
      {onFullscreen && (
        <div className="flex shrink-0 items-center justify-end border-b border-border/40 px-2 py-1">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={onFullscreen}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            전체화면
          </Button>
        </div>
      )}
      <div className={PREVIEW_SCROLL}>
        <MarkdownPreview content={markdown} />
      </div>
    </div>
  );
}

function PreviewFullscreenOverlay({
  markdown,
  onClose,
}: {
  markdown: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="미리보기 전체화면"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5 bg-muted/30">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          미리보기 · 전체화면
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono">
            Esc로 닫기
          </span>
          <Button type="button" size="xs" variant="outline" onClick={onClose}>
            <Minimize2 className="h-3 w-3 mr-1" />
            닫기
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="mx-auto w-full max-w-5xl">
          <MarkdownPreview content={markdown} />
        </div>
      </div>
    </div>
  );
}

export function MarkdownViewer() {
  const [markdown, setMarkdown] = useState(loadDraft);
  const [activeTab, setActiveTab] = useState("edit");
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  const openPreviewFullscreen = useCallback(() => {
    setPreviewFullscreen(true);
  }, []);

  const closePreviewFullscreen = useCallback(() => {
    setPreviewFullscreen(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) setActiveTab("split");

    const onResize = () => {
      setActiveTab((tab) => (!mq.matches && tab === "split" ? "edit" : tab));
    };
    mq.addEventListener("change", onResize);
    return () => mq.removeEventListener("change", onResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, markdown);
      } catch {
        /* ignore quota errors */
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [markdown]);

  useEffect(() => {
    if (!previewFullscreen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreviewFullscreen();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [previewFullscreen, closePreviewFullscreen]);

  const copyToClipboard = useCallback(() => {
    if (!markdown.trim()) {
      toast.error("복사할 내용이 없습니다.");
      return;
    }
    navigator.clipboard.writeText(markdown);
    toast.success("마크다운이 복사되었습니다.");
  }, [markdown]);

  const handleClear = () => {
    setMarkdown("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast.success("초기화되었습니다.");
  };

  const handleExample = () => {
    setMarkdown(EXAMPLE_MARKDOWN);
    toast.success("예시가 채워졌습니다.");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 w-full max-w-full">
      <div className="flex shrink-0 flex-wrap justify-between items-center gap-2 bg-muted/30 p-2 rounded-md border">
        <div className="flex flex-wrap gap-2">
          <Button size="xs" variant="outline" onClick={handleExample}>
            <FileText className="h-3 w-3 mr-1" />
            예시 채우기
          </Button>
          <Button size="xs" variant="outline" onClick={handleClear}>
            <Trash2 className="h-3 w-3 mr-1" />
            초기화
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={openPreviewFullscreen}
            disabled={!markdown.trim()}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            미리보기 전체화면
          </Button>
          <Button size="xs" onClick={copyToClipboard}>
            <Copy className="h-3 w-3 mr-1" />
            전체 복사
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex h-0 min-h-0 flex-1 flex-col w-full overflow-hidden"
      >
        <TabsList className="grid w-full shrink-0 grid-cols-2 md:grid-cols-3 h-9">
          <TabsTrigger value="split" className="text-xs hidden md:inline-flex">
            분할
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-xs">
            편집
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            미리보기
          </TabsTrigger>
        </TabsList>

        <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden pt-3">
          {activeTab === "split" && (
            <div className="hidden h-full min-h-0 flex-1 gap-4 overflow-hidden md:flex">
              <EditorPane
                id="markdown-input-split"
                markdown={markdown}
                onChange={setMarkdown}
                className="min-h-0 flex-1"
              />
              <PreviewPane
                markdown={markdown}
                className="min-h-0 flex-1"
                onFullscreen={openPreviewFullscreen}
              />
            </div>
          )}

          {activeTab === "edit" && (
            <EditorPane
              id="markdown-input-edit"
              markdown={markdown}
              onChange={setMarkdown}
              className="h-full min-h-0 flex-1"
            />
          )}

          {activeTab === "preview" && (
            <PreviewPane
              markdown={markdown}
              className="h-full min-h-0 flex-1"
              onFullscreen={openPreviewFullscreen}
            />
          )}
        </div>
      </Tabs>

      {previewFullscreen &&
        createPortal(
          <PreviewFullscreenOverlay
            markdown={markdown}
            onClose={closePreviewFullscreen}
          />,
          document.body
        )}
    </div>
  );
}
