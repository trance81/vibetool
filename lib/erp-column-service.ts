import fs from "node:fs";
import path from "node:path";

export type ErpColumnRow = {
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

export type ErpDatasetMeta = {
  sourceCsv: string;
  timestamp: string;
  timestampLabel: string;
  rowCount: number;
  modules: string[];
};

type ErpDataset = {
  meta: ErpDatasetMeta;
  rows: ErpColumnRow[];
};

const JSON_ROWS_PATTERN = /^ERP_컬럼정보_(\d+)\.json$/i;
const JSON_META_PATTERN = /^ERP_컬럼정보_(\d+)\.meta\.json$/i;

let cached: ErpDataset | null = null;

function stripQuotes(field: string): string {
  const t = field.trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/""/g, '"');
  }
  return t;
}

/** Used by build-erp-json and tests. ERP CSV: 10 columns (MODULE_CD … TABLE_NM). */
export function parseCsvLine(line: string): ErpColumnRow | null {
  if (!line.trim()) return null;
  const parts = line.split("|").map(stripQuotes);
  if (parts.length < 10) return null;
  const [
    moduleCd,
    colNm,
    colKorNm,
    formatDc,
    colsizeVr,
    rcodeDc,
    keyValYn,
    colSq,
    tableId,
    tableNm,
  ] = parts;
  if (colNm === "COL_NM" || moduleCd === "MODULE_CD") return null;
  return {
    moduleCd,
    colNm,
    colKorNm,
    formatDc,
    colsizeVr,
    rcodeDc,
    keyValYn,
    colSq,
    tableId,
    tableNm,
  };
}

export function formatTimestamp(ts: string): string {
  if (ts.length !== 12) return ts;
  const y = ts.slice(0, 4);
  const m = ts.slice(4, 6);
  const d = ts.slice(6, 8);
  const h = ts.slice(8, 10);
  const min = ts.slice(10, 12);
  return `${y}-${m}-${d} ${h}:${min}`;
}

function filesDir(rootDir: string): string {
  return path.join(rootDir, "src", "Files");
}

export function findLatestErpJsonDataset(rootDir: string): {
  timestamp: string;
  rowsPath: string;
  metaPath: string;
} | null {
  const dir = filesDir(rootDir);
  if (!fs.existsSync(dir)) return null;

  const metaByTs = new Map<string, string>();
  const rowsByTs = new Map<string, string>();

  for (const name of fs.readdirSync(dir)) {
    const metaMatch = name.match(JSON_META_PATTERN);
    if (metaMatch) {
      metaByTs.set(metaMatch[1], path.join(dir, name));
      continue;
    }
    const rowsMatch = name.match(JSON_ROWS_PATTERN);
    if (rowsMatch) {
      rowsByTs.set(rowsMatch[1], path.join(dir, name));
    }
  }

  let bestTs: string | null = null;
  for (const ts of rowsByTs.keys()) {
    if (!metaByTs.has(ts)) continue;
    if (!bestTs || ts > bestTs) bestTs = ts;
  }

  if (!bestTs) return null;

  return {
    timestamp: bestTs,
    rowsPath: rowsByTs.get(bestTs)!,
    metaPath: metaByTs.get(bestTs)!,
  };
}

/** Resolve project root (local dev vs Vercel serverless cwd). */
export function resolveProjectRoot(): string {
  const candidates = [
    process.cwd(),
    path.join(process.cwd(), ".."),
    path.join(process.cwd(), "../.."),
  ];
  for (const root of candidates) {
    if (findLatestErpJsonDataset(root)) return root;
  }
  return process.cwd();
}

function readMetaFile(metaPath: string): ErpDatasetMeta {
  const raw = fs.readFileSync(metaPath, "utf8");
  const meta = JSON.parse(raw) as ErpDatasetMeta;
  if (typeof meta.rowCount !== "number" || !Array.isArray(meta.modules)) {
    throw new Error("ERP meta JSON format is invalid");
  }
  return meta;
}

function readRowsFile(rowsPath: string): ErpColumnRow[] {
  const raw = fs.readFileSync(rowsPath, "utf8");
  const rows = JSON.parse(raw) as ErpColumnRow[];
  if (!Array.isArray(rows)) {
    throw new Error("ERP rows JSON format is invalid");
  }
  return rows;
}

function loadDataset(rootDir: string): ErpDataset {
  const latest = findLatestErpJsonDataset(rootDir);
  if (!latest) {
    throw new Error(
      "ERP column JSON not found. Run: npm run build:erp-json",
    );
  }

  if (
    cached &&
    cached.meta.timestamp === latest.timestamp &&
    cached.rows.length > 0
  ) {
    return cached;
  }

  const meta = readMetaFile(latest.metaPath);
  const rows = readRowsFile(latest.rowsPath);

  cached = { meta, rows };
  return cached;
}

function collectModuleCodes(rows: ErpColumnRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const m = r.moduleCd?.trim();
    if (m) set.add(m);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getErpDatasetMeta(
  rootDir: string = resolveProjectRoot(),
): ErpDatasetMeta {
  if (cached && cached.rows.length > 0) {
    return { ...cached.meta, modules: collectModuleCodes(cached.rows) };
  }

  const latest = findLatestErpJsonDataset(rootDir);
  if (!latest) {
    throw new Error(
      "ERP column JSON not found. Run: npm run build:erp-json",
    );
  }

  return readMetaFile(latest.metaPath);
}

export function getErpModuleCodes(
  rootDir: string = resolveProjectRoot(),
): string[] {
  return getErpDatasetMeta(rootDir).modules;
}

export function parseModulesFilter(
  raw: string | string[] | undefined,
): Set<string> | null {
  if (raw == null) return null;
  const parts = Array.isArray(raw)
    ? raw.flatMap((v) => String(v).split(","))
    : String(raw).split(",");
  const codes = parts.map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (codes.length === 0) return null;
  return new Set(codes);
}

export function searchErpColumns(
  query: string,
  rootDir?: string,
  limit = 200,
  modulesFilter: Set<string> | null = null,
): ErpColumnRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const { rows } = loadDataset(rootDir ?? resolveProjectRoot());
  const out: ErpColumnRow[] = [];

  for (let i = 0; i < rows.length && out.length < limit; i++) {
    const r = rows[i];
    if (
      modulesFilter &&
      modulesFilter.size > 0 &&
      !modulesFilter.has(r.moduleCd.trim().toUpperCase())
    ) {
      continue;
    }
    if (
      r.colNm.toLowerCase().includes(q) ||
      r.tableId.toLowerCase().includes(q) ||
      r.tableNm.toLowerCase().includes(q) ||
      r.colKorNm.toLowerCase().includes(q) ||
      r.moduleCd.toLowerCase().includes(q)
    ) {
      out.push(r);
    }
  }

  return out;
}

export function getErpTableColumns(
  tableId: string,
  rootDir: string = resolveProjectRoot(),
): { tableId: string; tableNm: string; rows: ErpColumnRow[] } {
  const id = tableId.trim().toUpperCase();
  const { rows } = loadDataset(rootDir);
  const matched = rows.filter((r) => r.tableId.toUpperCase() === id);
  const tableNm = matched[0]?.tableNm ?? "";
  return { tableId: id, tableNm, rows: matched };
}

/** Test-only: clear in-memory cache after dataset swap */
export function clearErpDatasetCache(): void {
  cached = null;
}
