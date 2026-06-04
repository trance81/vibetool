import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  Loader2,
  Package,
  Search,
  Shapes,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconGridPagination } from "@/src/components/IconGridPagination";
import { cn } from "@/lib/utils";
import {
  ICON_LIBRARIES,
  fetchIconNames,
  searchAllIconLibraries,
  getIconLibrary,
  type IconSearchHit,
} from "@/src/lib/icon-libraries";
import {
  downloadIconIco,
  downloadIconSvg,
  getPreviewIconUrl,
} from "@/src/lib/icon-export";

const CELL_HEIGHT = 56;
const GRID_GAP = 6;

/** 다운로드용 출력 크기 (16~256) */
const EXPORT_SIZE_OPTIONS = [
  16, 24, 32, 48, 64, 96, 128, 192, 256,
] as const;

type GridItem = {
  key: string;
  prefix: string;
  name: string;
  libraryId: string;
  libraryLabel?: string;
};

function getColumnCount(width: number): number {
  if (width >= 960) return 10;
  if (width >= 720) return 8;
  if (width >= 520) return 6;
  return 4;
}

function hitToGridItem(hit: IconSearchHit): GridItem {
  return {
    key: `${hit.prefix}:${hit.name}`,
    prefix: hit.prefix,
    name: hit.name,
    libraryId: hit.libraryId,
    libraryLabel: hit.libraryName,
  };
}

export function FreeIcons() {
  const [libraryId, setLibraryId] = useState(ICON_LIBRARIES[0].id);
  const [allNames, setAllNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<
    IconSearchHit[] | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<GridItem | null>(null);

  const [cols, setCols] = useState(8);
  const [pageSize, setPageSize] = useState(32);
  const gridAreaRef = useRef<HTMLDivElement>(null);

  const [iconColor, setIconColor] = useState("#f8fafc");
  const [backgroundColor, setBackgroundColor] = useState("#818cf8");
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [exportSizes, setExportSizes] = useState<number[]>([64]);
  const [downloading, setDownloading] = useState<"svg" | "ico" | null>(null);

  const sortedExportSizes = useMemo(
    () => [...exportSizes].sort((a, b) => a - b),
    [exportSizes]
  );

  const toggleExportSize = (size: number) => {
    setExportSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== size);
      }
      return [...prev, size].sort((a, b) => a - b);
    });
  };

  const library = getIconLibrary(libraryId) ?? ICON_LIBRARIES[0];
  const isGlobalSearch = searchQuery.trim().length > 0;

  const displayItems = useMemo((): GridItem[] => {
    if (!isGlobalSearch) {
      return allNames.map((name) => ({
        key: `${library.iconifyPrefix}:${name}`,
        prefix: library.iconifyPrefix,
        name,
        libraryId: library.id,
      }));
    }

    if (globalSearchResults && globalSearchResults.length > 0) {
      return globalSearchResults.map(hitToGridItem);
    }

    const q = searchQuery.trim().toLowerCase();
    return allNames
      .filter((name) => name.toLowerCase().includes(q))
      .map((name) => ({
        key: `${library.iconifyPrefix}:${name}`,
        prefix: library.iconifyPrefix,
        name,
        libraryId: library.id,
      }));
  }, [
    allNames,
    globalSearchResults,
    isGlobalSearch,
    library.iconifyPrefix,
    library.id,
    searchQuery,
  ]);

  const pageCount = Math.max(1, Math.ceil(displayItems.length / pageSize) || 1);
  const pageItems = displayItems.slice(
    page * pageSize,
    page * pageSize + pageSize
  );
  const rowCount = Math.max(1, Math.ceil(pageItems.length / cols) || 1);

  const activeLibrary =
    getIconLibrary(selected?.libraryId ?? libraryId) ?? library;

  /** 검색 중에는 선택한 아이콘의 라이브러리만 강조 (libraryId 변경으로 effect 재실행 방지) */
  const highlightedLibraryId =
    isGlobalSearch && selected ? selected.libraryId : libraryId;

  useEffect(() => {
    const el = gridAreaRef.current;
    if (!el) return;

    const updateLayout = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      const columnCount = getColumnCount(width);
      const rows = Math.max(
        1,
        Math.floor((height + GRID_GAP) / (CELL_HEIGHT + GRID_GAP))
      );
      setCols(columnCount);
      setPageSize(columnCount * rows);
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  useEffect(() => {
    if (searchQuery.trim()) return;

    let cancelled = false;
    setLoading(true);
    setAllNames([]);
    setPage(0);

    const lib = getIconLibrary(libraryId) ?? ICON_LIBRARIES[0];

    fetchIconNames(lib.iconifyPrefix)
      .then((names) => {
        if (!cancelled) {
          setAllNames(names);
          setSelected((prev) => {
            if (
              prev &&
              prev.libraryId === lib.id &&
              names.includes(prev.name)
            ) {
              return prev;
            }
            const first = names[0];
            return first
              ? {
                  key: `${lib.iconifyPrefix}:${first}`,
                  prefix: lib.iconifyPrefix,
                  name: first,
                  libraryId: lib.id,
                }
              : null;
          });
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("아이콘 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [libraryId, searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setGlobalSearchResults(null);
      setSearchLoading(false);
      setPage(0);
      if (selected) {
        setLibraryId(selected.libraryId);
      }
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      searchAllIconLibraries(q)
        .then((hits) => {
          setGlobalSearchResults(hits);
          setPage(0);
          if (hits.length > 0) {
            setSelected(hitToGridItem(hits[0]));
          } else {
            setSelected(null);
          }
        })
        .catch(() => {
          setGlobalSearchResults(null);
          toast.error("전체 검색에 실패했습니다.");
        })
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectItem = (item: GridItem) => {
    setSelected(item);
  };

  const handleSidebarLibrary = (id: string) => {
    setLibraryId(id);
    if (!searchQuery.trim()) {
      setPage(0);
    }
  };

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(activeLibrary.installCommand);
    toast.success("설치 명령어가 복사되었습니다.");
  };

  const handleDownload = async (format: "svg" | "ico") => {
    if (!selected) {
      toast.error("아이콘을 선택해 주세요.");
      return;
    }
    if (sortedExportSizes.length === 0) {
      toast.error("출력 크기를 하나 이상 선택해 주세요.");
      return;
    }

    setDownloading(format);
    try {
      const options = {
        prefix: selected.prefix,
        name: selected.name,
        iconColor,
        backgroundColor,
        transparentBackground,
        size: Math.max(...sortedExportSizes),
      };
      if (format === "svg") await downloadIconSvg(options, sortedExportSizes);
      else await downloadIconIco(options, sortedExportSizes);

      const sizeLabel = sortedExportSizes.map((s) => `${s}px`).join(", ");
      if (format === "svg" && sortedExportSizes.length > 1) {
        toast.success(
          `SVG ${sortedExportSizes.length}개 (${sizeLabel})를 다운로드했습니다.`
        );
      } else if (format === "ico") {
        toast.success(`ICO (${sizeLabel} 포함)를 다운로드했습니다.`);
      } else {
        toast.success("SVG 파일을 다운로드했습니다.");
      }
    } catch {
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setDownloading(null);
    }
  };

  const previewUrl = selected
    ? getPreviewIconUrl(selected.prefix, selected.name, iconColor, 96)
    : null;

  const gridBusy = loading || searchLoading;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-12 lg:items-stretch lg:gap-4">
      <aside className="shrink-0 space-y-2 lg:col-span-2 lg:flex lg:flex-col lg:min-h-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">
          라이브러리
        </p>
        <ScrollArea className="max-h-[140px] rounded-lg border border-border/60 lg:max-h-none lg:flex-1">
          <div className="flex flex-row flex-wrap gap-1 p-1 lg:flex-col">
            {ICON_LIBRARIES.map((lib) => (
              <button
                key={lib.id}
                type="button"
                onClick={() => handleSidebarLibrary(lib.id)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-left text-[11px] font-bold transition-colors w-full",
                  highlightedLibraryId === lib.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {lib.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col gap-2 lg:col-span-7 lg:h-full lg:overflow-hidden">
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="전체 라이브러리에서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Badge
            variant="outline"
            className="shrink-0 font-mono text-[10px] h-9 px-2 flex items-center justify-center"
          >
            {gridBusy
              ? "…"
              : isGlobalSearch
                ? `전체 ${displayItems.length}개`
                : `${displayItems.length}개`}
          </Badge>
        </div>

        {isGlobalSearch && !gridBusy && (
          <p className="text-[10px] text-muted-foreground shrink-0">
            등록된 7개 라이브러리에서 동시에 검색합니다. 아이콘 선택 시 해당
            라이브러리로 전환됩니다.
          </p>
        )}

        <div
          ref={gridAreaRef}
          className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border/60 bg-card/20"
        >
          {gridBusy ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              {searchLoading ? "전체 검색 중…" : "불러오는 중…"}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div
              className="grid h-full w-full p-2"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rowCount}, ${CELL_HEIGHT}px)`,
                gap: GRID_GAP,
              }}
            >
              {pageItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  title={
                    item.libraryLabel
                      ? `${item.libraryLabel} · ${item.name}`
                      : item.name
                  }
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    "flex h-full min-h-0 flex-col items-center justify-center gap-0.5 rounded-md border px-0.5 transition-all hover:bg-muted/40",
                    selected?.key === item.key
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-transparent"
                  )}
                >
                  <img
                    src={getPreviewIconUrl(
                      item.prefix,
                      item.name,
                      iconColor,
                      26
                    )}
                    alt=""
                    width={26}
                    height={26}
                    className="shrink-0"
                    loading="lazy"
                  />
                  <span className="w-full truncate text-center text-[8px] font-mono text-muted-foreground leading-none">
                    {item.name}
                  </span>
                  {item.libraryLabel && (
                    <span className="w-full truncate text-center text-[7px] text-primary/80 leading-none">
                      {item.libraryLabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <IconGridPagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </section>

      <aside className="shrink-0 space-y-3 min-w-0 lg:col-span-3 lg:overflow-y-auto lg:max-h-full">
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-4">
            <div
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg border border-border/50"
              style={{
                backgroundColor: transparentBackground
                  ? "transparent"
                  : backgroundColor,
                backgroundImage: transparentBackground
                  ? "linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)"
                  : undefined,
                backgroundSize: transparentBackground ? "12px 12px" : undefined,
                backgroundPosition: transparentBackground
                  ? "0 0, 0 6px, 6px -6px, -6px 0"
                  : undefined,
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="" width={72} height={72} />
              ) : (
                <Shapes className="h-10 w-10 text-muted-foreground/40" />
              )}
            </div>

            {selected && (
              <div className="space-y-0.5 text-center">
                <p className="font-mono text-xs font-bold text-foreground truncate">
                  {selected.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeLibrary.name}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor="icon-color"
                  className="text-[10px] uppercase font-bold text-muted-foreground"
                >
                  아이콘 색
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="icon-color"
                    type="color"
                    value={iconColor}
                    onChange={(e) => setIconColor(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <Input
                    value={iconColor}
                    onChange={(e) => setIconColor(e.target.value)}
                    className="h-8 w-24 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor="bg-transparent"
                  className="text-[10px] uppercase font-bold text-muted-foreground"
                >
                  투명 배경
                </Label>
                <Switch
                  id="bg-transparent"
                  checked={transparentBackground}
                  onCheckedChange={setTransparentBackground}
                />
              </div>

              {!transparentBackground && (
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="bg-color"
                    className="text-[10px] uppercase font-bold text-muted-foreground"
                  >
                    배경 색
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-24 font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    출력 크기
                  </Label>
                  <span className="text-[9px] text-muted-foreground">
                    {sortedExportSizes.length > 0
                      ? sortedExportSizes.map((s) => `${s}px`).join(" · ")
                      : "선택 없음"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {EXPORT_SIZE_OPTIONS.map((size) => {
                    const active = exportSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleExportSize(size)}
                        className={cn(
                          "min-w-9 rounded-md border px-2 py-1 text-[10px] font-mono font-bold transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-muted-foreground">
                  여러 크기를 선택하면 SVG는 파일별, ICO는 한 파일에
                  포함됩니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                className="w-full"
                disabled={
                  !selected ||
                  downloading !== null ||
                  sortedExportSizes.length === 0
                }
                onClick={() => handleDownload("svg")}
              >
                {downloading === "svg" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                SVG 다운로드
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={
                  !selected ||
                  downloading !== null ||
                  sortedExportSizes.length === 0
                }
                onClick={() => handleDownload("ico")}
              >
                {downloading === "ico" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                ICO 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary">
              <Package className="h-3.5 w-3.5" />
              설치 · {activeLibrary.name}
            </div>
            <p className="text-[9px] text-muted-foreground">
              {activeLibrary.license} · 무료
            </p>
            <code className="block rounded border border-border/60 bg-background/80 px-2 py-1.5 text-[10px] font-mono text-foreground break-all">
              {activeLibrary.installCommand}
            </code>
            <code className="block rounded border border-dashed border-border/40 px-2 py-1 text-[9px] font-mono text-muted-foreground break-all">
              {activeLibrary.usageHint}
            </code>
            <div className="flex gap-2">
              <Button
                size="xs"
                variant="outline"
                className="flex-1"
                onClick={copyInstallCommand}
              >
                <Copy className="h-3 w-3 mr-1" />
                명령어 복사
              </Button>
              <Button size="xs" variant="ghost" className="flex-1" asChild>
                <a
                  href={activeLibrary.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  문서
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
