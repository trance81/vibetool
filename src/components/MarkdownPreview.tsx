import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

let mermaidInitialized = false;

function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "strict",
            themeVariables: {
              primaryColor: "#818cf8",
              primaryTextColor: "#f8fafc",
              primaryBorderColor: "#475569",
              lineColor: "#cbd5e1",
              secondaryColor: "#1e293b",
              tertiaryColor: "#111113",
            },
          });
          mermaidInitialized = true;
        }

        const { svg } = await mermaid.render(`mermaid-${id}-${Date.now()}`, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "다이어그램을 렌더링할 수 없습니다."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div
        role="alert"
        className="my-4 rounded-lg border border-amber-400/45 bg-amber-500/20 px-3 py-2 text-sm text-amber-50"
      >
        <span className="font-semibold text-white">Mermaid 오류: </span>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex max-w-full justify-center overflow-x-auto rounded-md border border-border/40 bg-card/50 p-4 [&_svg]:max-w-full [&_svg]:h-auto"
    />
  );
}

const markdownComponents: Components = {
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-md border border-border">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const code = String(children).replace(/\n$/, "");

    if (match?.[1] === "mermaid") {
      return <MermaidBlock chart={code} />;
    }

    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className={cn("block font-mono text-sm", className)}>{code}</code>
      );
    }

    return <code>{children}</code>;
  },
};

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        미리보기할 마크다운을 입력하세요.
      </p>
    );
  }

  return (
    <div className={cn("markdown-preview max-w-full", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
