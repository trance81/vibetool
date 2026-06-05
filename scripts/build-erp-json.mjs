/**
 * Converts the latest ERP_컬럼정보_*.csv to JSON for runtime API reads.
 * Output: api/erp-columns/data/meta.json + rows.json (ASCII paths for Vercel).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES_DIR = path.join(ROOT, "src", "Files");
const DATA_DIR = path.join(ROOT, "api", "erp-columns", "data");
const CSV_PATTERN = /^ERP_컬럼정보_(\d+)\.csv$/i;

function stripQuotes(field) {
  const t = field.trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/""/g, '"');
  }
  return t;
}

function parseCsvLine(line) {
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

function formatTimestamp(ts) {
  if (ts.length !== 12) return ts;
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)} ${ts.slice(8, 10)}:${ts.slice(10, 12)}`;
}

function findLatestCsv() {
  if (!fs.existsSync(FILES_DIR)) return null;
  let best = null;
  for (const name of fs.readdirSync(FILES_DIR)) {
    const match = name.match(CSV_PATTERN);
    if (!match) continue;
    const timestamp = match[1];
    if (!best || timestamp > best.timestamp) {
      best = {
        timestamp,
        csvPath: path.join(FILES_DIR, name),
        csvName: name,
      };
    }
  }
  return best;
}

function isUpToDate(csvPath, metaPath, rowsPath) {
  if (!fs.existsSync(metaPath) || !fs.existsSync(rowsPath)) return false;
  const csvMtime = fs.statSync(csvPath).mtimeMs;
  return (
    fs.statSync(metaPath).mtimeMs >= csvMtime &&
    fs.statSync(rowsPath).mtimeMs >= csvMtime
  );
}

function main() {
  const latest = findLatestCsv();
  if (!latest) {
    console.warn("build:erp-json — no ERP CSV in src/Files, skipping");
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const metaPath = path.join(DATA_DIR, "meta.json");
  const rowsPath = path.join(DATA_DIR, "rows.json");

  if (isUpToDate(latest.csvPath, metaPath, rowsPath)) {
    console.log("build:erp-json — up to date (api/erp-columns/data/)");
    return;
  }

  const raw = fs.readFileSync(latest.csvPath, "utf8");
  const rows = [];
  const modules = new Set();

  for (const line of raw.split(/\r?\n/)) {
    const row = parseCsvLine(line);
    if (!row) continue;
    rows.push(row);
    const m = row.moduleCd?.trim();
    if (m) modules.add(m);
  }

  const meta = {
    sourceCsv: latest.csvName,
    timestamp: latest.timestamp,
    timestampLabel: formatTimestamp(latest.timestamp),
    rowCount: rows.length,
    modules: [...modules].sort((a, b) => a.localeCompare(b)),
  };

  fs.writeFileSync(rowsPath, JSON.stringify(rows));
  fs.writeFileSync(metaPath, JSON.stringify(meta));

  const rowsMb = (fs.statSync(rowsPath).size / 1024 / 1024).toFixed(2);
  console.log(
    `build:erp-json — wrote api/erp-columns/data/ (${rows.length} rows, ${rowsMb} MB)`,
  );
}

main();
