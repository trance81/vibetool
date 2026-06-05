import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ChevronDown,
  Copy,
  Database,
  Loader2,
  Lock,
  Search,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  clearLegacyErpColumnSession,
  verifyErpColumnPin,
} from "@/src/lib/erp-column-pin";

type ErpColumnRow = {
  moduleCd: string;
  colNm: string;
  colKorNm: string;
  formatDc: string;
  colsizeVr: string;
  rcodeDc: string;
  keyValYn: string;
  colSq: string;
  tableId: string;
  tableNm: string;
};

type Meta = {
  filename: string;
  timestamp: string;
  timestampLabel: string;
  rowCount: number;
  modules: string[];
};

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("클립보드에 복사되었습니다.");
}

function sortRowsByColSq(rows: ErpColumnRow[]): ErpColumnRow[] {
  return [...rows].sort((a, b) => {
    const sa = parseInt(a.colSq, 10);
    const sb = parseInt(b.colSq, 10);
    if (!Number.isNaN(sa) && !Number.isNaN(sb) && sa !== sb) return sa - sb;
    return a.colNm.localeCompare(b.colNm);
  });
}

function cellOrDash(value: string) {
  return value?.trim() ? value : "—";
}

async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const preview = text.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(
      `API가 JSON이 아닌 응답을 반환했습니다 (${res.status}): ${preview}`,
    );
  }
  return JSON.parse(text) as T;
}

export function ErpColumnLookup() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    clearLegacyErpColumnSession();
    setUnlocked(false);
    setPin("");
  }, []);

  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    () => new Set(),
  );
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ErpColumnRow[]>([]);
  const [resultLimit, setResultLimit] = useState(200);

  const [tableOpen, setTableOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableTitle, setTableTitle] = useState("");
  const [tableRows, setTableRows] = useState<ErpColumnRow[]>([]);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const res = await fetch("/api/erp-columns/meta");
      const body = await readApiJson<Meta & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(body.error ?? `meta HTTP ${res.status}`);
      }
      if (typeof body.rowCount !== "number") {
        throw new Error("meta 응답 형식이 올바르지 않습니다.");
      }
      if (body.rowCount === 0) {
        setMetaError(
          "CSV에서 읽은 행이 0건입니다. dev 서버를 재시작한 뒤 새로고침해 주세요.",
        );
        setMeta(null);
        return;
      }
      const data: Meta = {
        filename: body.filename,
        timestamp: body.timestamp,
        timestampLabel: body.timestampLabel,
        rowCount: body.rowCount,
        modules: Array.isArray(body.modules) ? body.modules : [],
      };
      if (data.modules.length === 0) {
        try {
          const modRes = await fetch("/api/erp-columns/modules");
          if (modRes.ok) {
            const modBody = (await modRes.json()) as { modules?: string[] };
            if (Array.isArray(modBody.modules)) {
              data.modules = modBody.modules;
            }
          }
        } catch {
          /* meta는 성공 — 모듈 목록만 비어 있을 수 있음 */
        }
      }
      setMeta(data);
    } catch (err) {
      const hint =
        err instanceof Error && err.message
          ? err.message
          : "네트워크 오류";
      const envHint = import.meta.env.DEV
        ? " · 로컬에서는 npm run dev 로 실행하세요."
        : " · Vercel이면 재배포 후 Function 로그를 확인하세요.";
      setMetaError(`ERP 컬럼 데이터를 불러오지 못했습니다. (${hint})${envHint}`);
      setMeta(null);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadMeta();
  }, [unlocked, loadMeta]);

  const moduleList = useMemo(
    () => meta?.modules ?? [],
    [meta?.modules],
  );

  const modulesKey = useMemo(
    () =>
      selectedModules.size === 0
        ? ""
        : [...selectedModules].sort().join(","),
    [selectedModules],
  );

  useEffect(() => {
    if (!unlocked || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          limit: "200",
        });
        if (modulesKey) {
          params.set("modules", modulesKey);
        }
        const res = await fetch(`/api/erp-columns/search?${params}`);
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as {
          rows: ErpColumnRow[];
          limit: number;
        };
        setResults(data.rows);
        setResultLimit(data.limit);
      } catch {
        toast.error("검색에 실패했습니다.");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, unlocked, modulesKey]);

  const handlePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPinLoading(true);
    try {
      const ok = await verifyErpColumnPin(pin);
      if (!ok) {
        toast.error("PIN이 올바르지 않습니다.");
        return;
      }
      setUnlocked(true);
      setPin("");
      toast.success("접근이 허용되었습니다.");
    } finally {
      setPinLoading(false);
    }
  };

  const openTableDefinition = async (tableId: string) => {
    setTableOpen(true);
    setTableLoading(true);
    setTableRows([]);
    setTableTitle(tableId);
    try {
      const res = await fetch(
        `/api/erp-columns/table?tableId=${encodeURIComponent(tableId)}`,
      );
      if (!res.ok) throw new Error("table failed");
      const data = (await res.json()) as {
        tableId: string;
        tableNm: string;
        rows: ErpColumnRow[];
      };
      setTableTitle(
        data.tableNm
          ? `${data.tableId} · ${data.tableNm}`
          : data.tableId,
      );
      setTableRows(sortRowsByColSq(data.rows));
    } catch {
      toast.error("테이블 정의를 불러오지 못했습니다.");
      setTableOpen(false);
    } finally {
      setTableLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="flex flex-1 flex-col min-h-0 items-center justify-center p-6">
        <CardPinGate
          pin={pin}
          setPin={setPin}
          loading={pinLoading}
          onSubmit={handlePinSubmit}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 bg-muted/30 border rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-bold text-foreground">데이터 버전</span>
          {metaLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {meta && (
            <>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {meta.timestampLabel}
              </Badge>
              <span className="text-muted-foreground font-mono text-[10px]">
                {meta.filename}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {meta.rowCount.toLocaleString()}행
              </span>
            </>
          )}
          {metaError && (
            <span className="text-destructive text-[10px]">{metaError}</span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => loadMeta()}
          disabled={metaLoading}
        >
          새로고침
        </Button>
      </div>

      <div className="space-y-2 shrink-0">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2 min-w-[12rem] flex-1 max-w-xs">
            <Label>모듈 (MODULE_CD)</Label>
            <ModuleMultiSelect
              modules={moduleList}
              selected={selectedModules}
              onChange={setSelectedModules}
              disabled={metaLoading}
              loading={metaLoading}
            />
          </div>
          <div className="space-y-2 flex-[2] min-w-[12rem]">
            <Label htmlFor="erp-search">컬럼·테이블 검색</Label>
            <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="erp-search"
            placeholder="COL_NM, TABLE_ID, 테이블명, 한글명…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 font-mono text-sm"
            autoComplete="off"
          />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          모듈: {selectedModules.size === 0 ? "전체" : [...selectedModules].sort().join(", ")}
          {" · "}COL_NM 클릭 → 복사 · TABLE_ID 클릭 → 테이블 정의서
          {searching && " · 검색 중…"}
          {!searching && query.trim() && (
            <> · 최대 {resultLimit}건 표시</>
          )}
        </p>
      </div>

      <div className="flex flex-1 min-h-0 border border-border/60 rounded-lg overflow-hidden bg-card/20">
        <ScrollArea className="h-full w-full">
          {!query.trim() ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              검색어를 입력하세요.
            </p>
          ) : results.length === 0 && !searching ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              결과가 없습니다.
            </p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm border-b">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-bold">MODULE</th>
                  <th className="px-3 py-2 font-bold">COL_NM</th>
                  <th className="px-3 py-2 font-bold">한글명</th>
                  <th className="px-3 py-2 font-bold">PK</th>
                  <th className="px-3 py-2 font-bold">RCODE</th>
                  <th className="px-3 py-2 font-bold">TABLE_ID</th>
                  <th className="px-3 py-2 font-bold">테이블명</th>
                  <th className="px-3 py-2 font-bold">형식</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr
                    key={`${row.tableId}-${row.colNm}-${row.colSq}-${i}`}
                    className="border-b border-border/40 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                      {row.moduleCd}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="font-mono font-bold text-primary hover:underline text-left"
                        onClick={() => copyText(row.colNm)}
                        title="클릭하여 COL_NM 복사"
                      >
                        {row.colNm}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {row.colKorNm}
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px]">
                      {cellOrDash(row.keyValYn)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground max-w-[8rem] truncate" title={row.rcodeDc}>
                      {cellOrDash(row.rcodeDc)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="font-mono text-foreground hover:text-primary hover:underline"
                        onClick={() => openTableDefinition(row.tableId)}
                        title="테이블 정의서 보기"
                      >
                        {row.tableId}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.tableNm}
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                      {row.formatDc}
                      {row.colsizeVr ? ` (${row.colsizeVr})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ScrollArea>
      </div>

      <Dialog open={tableOpen} onOpenChange={setTableOpen}>
        <DialogContent
          className="sm:max-w-4xl w-[calc(100%-2rem)] h-[min(85vh,720px)] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden"
          showCloseButton
        >
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <TableProperties className="h-4 w-4 text-primary" />
              테이블 정의서
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {tableTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
            {tableLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b">
                  <tr className="text-[10px] uppercase text-muted-foreground">
                    <th className="px-3 py-2">순서</th>
                    <th className="px-3 py-2">MODULE</th>
                    <th className="px-3 py-2">COL_NM</th>
                    <th className="px-3 py-2">한글명</th>
                    <th className="px-3 py-2">형식</th>
                    <th className="px-3 py-2">PK</th>
                    <th className="px-3 py-2">RCODE</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr
                      key={`${row.colNm}-${row.colSq}-${i}`}
                      className="border-b border-border/30 hover:bg-muted/15"
                    >
                      <td className="px-3 py-1.5 font-mono text-muted-foreground">
                        {row.colSq}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                        {row.moduleCd}
                      </td>
                      <td className="px-3 py-1.5">
                        <button
                          type="button"
                          className="font-mono font-bold text-primary hover:underline"
                          onClick={() => copyText(row.colNm)}
                        >
                          {row.colNm}
                        </button>
                      </td>
                      <td className="px-3 py-1.5">{row.colKorNm}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px]">
                        {row.formatDc}
                        {row.colsizeVr ? ` (${row.colsizeVr})` : ""}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[10px]">
                        {cellOrDash(row.keyValYn)}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-muted-foreground max-w-[10rem] truncate" title={row.rcodeDc}>
                        {cellOrDash(row.rcodeDc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-4 py-2 border-t text-[10px] text-muted-foreground shrink-0">
            {tableRows.length.toLocaleString()}개 컬럼 · COL_SQ 순
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleMultiSelect({
  modules,
  selected,
  onChange,
  disabled,
  loading,
}: {
  modules: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const allSelected = selected.size === 0;

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter((m) => m.toLowerCase().includes(q));
  }, [modules, filter]);

  const triggerLabel = useMemo(() => {
    if (allSelected) return "전체";
    const sorted = [...selected].sort();
    if (sorted.length <= 2) return sorted.join(", ");
    return `${sorted.slice(0, 2).join(", ")} 외 ${sorted.length - 2}`;
  }, [allSelected, selected]);

  const toggleModule = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full justify-between font-mono font-normal px-3"
          />
        }
      >
        <span className="truncate">
          {loading ? "모듈 불러오는 중…" : triggerLabel}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-56 max-w-80 p-0"
      >
        <div className="p-2 border-b border-border/60 space-y-2">
          <Input
            placeholder="모듈 검색…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 text-xs font-mono"
            autoComplete="off"
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs font-bold text-left",
              "hover:bg-muted/30",
              allSelected && "bg-primary/10",
            )}
            onClick={() => onChange(new Set())}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded border border-input",
                allSelected && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {allSelected ? <span className="text-[10px]">✓</span> : null}
            </span>
            전체
          </button>
        </div>
        <div className="max-h-[min(16rem,40vh)] overflow-y-auto overscroll-y-contain">
          <div className="p-1.5 space-y-0.5">
            {modules.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground text-center">
                {loading ? "모듈 목록 로딩 중…" : "모듈 목록이 없습니다. 새로고침해 주세요."}
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground text-center">
                일치하는 모듈이 없습니다.
              </p>
            ) : (
              filtered.map((code) => {
                const checked = selected.has(code);
                return (
                  <button
                    key={code}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-2 py-1.5 rounded font-mono text-xs text-left",
                      "hover:bg-muted/30",
                      checked && "bg-primary/10",
                    )}
                    onClick={() => toggleModule(code)}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border border-input",
                        checked &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {checked ? <span className="text-[10px]">✓</span> : null}
                    </span>
                    {code}
                  </button>
                );
              })
            )}
          </div>
        </div>
        {selected.size > 0 && (
          <div className="p-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="w-full text-xs"
              onClick={() => onChange(new Set())}
            >
              선택 초기화 (전체)
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function CardPinGate({
  pin,
  setPin,
  loading,
  onSubmit,
}: {
  pin: string;
  setPin: (v: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 border border-border rounded-xl bg-card/50 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm font-bold">
        <Lock className="h-4 w-4 text-primary" />
        내부 도구 — PIN 입력
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        ERP 컬럼 조회는 내부용입니다. 도구에 들어올 때마다 PIN을 입력해야
        합니다.
      </p>
      <div className="space-y-2">
        <Label htmlFor="erp-pin">PIN</Label>
        <Input
          id="erp-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="font-mono"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading || !pin}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "접근"
        )}
      </Button>
    </form>
  );
}
