import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WINDOW_SIZE = 10;

interface IconGridPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function IconGridPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: IconGridPaginationProps) {
  const current = page + 1;
  const maxStart = Math.max(0, pageCount - WINDOW_SIZE);
  const start = Math.min(Math.max(0, page - 4), maxStart);
  const end = Math.min(pageCount, start + WINDOW_SIZE);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-center gap-1 py-2",
        className
      )}
    >
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="h-7 min-w-7 px-1 font-mono text-[10px]"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
        aria-label="첫 페이지"
      >
        &lt;&lt;
      </Button>
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="h-7 min-w-7 px-1 font-mono text-[10px]"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="이전 페이지"
      >
        &lt;
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          type="button"
          size="xs"
          variant={p === page ? "default" : "outline"}
          className="h-7 min-w-7 px-1.5 font-mono text-[10px]"
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </Button>
      ))}

      <Button
        type="button"
        size="xs"
        variant="outline"
        className="h-7 min-w-7 px-1 font-mono text-[10px]"
        disabled={page >= pageCount - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="다음 페이지"
      >
        &gt;
      </Button>
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="h-7 min-w-7 px-1 font-mono text-[10px]"
        disabled={page >= pageCount - 1}
        onClick={() => onPageChange(pageCount - 1)}
        aria-label="마지막 페이지"
      >
        &gt;&gt;
      </Button>

      <span className="ml-2 font-mono text-[11px] font-bold text-muted-foreground tabular-nums">
        {current}/{pageCount}
      </span>
    </div>
  );
}
