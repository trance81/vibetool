const ICONIFY_CDN = "https://api.iconify.design";

export interface IconExportOptions {
  prefix: string;
  name: string;
  iconColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  size: number;
}

export async function fetchRawSvg(prefix: string, name: string): Promise<string> {
  const res = await fetch(`${ICONIFY_CDN}/${prefix}/${name}.svg`);
  if (!res.ok) throw new Error("SVG를 가져오지 못했습니다.");
  return res.text();
}

function normalizeColor(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

/** SVG에 아이콘 색상 적용 (currentColor 기반) */
export function applyIconColor(svg: string, color: string): string {
  let result = svg;

  if (!/currentColor/i.test(result) && !/fill="/i.test(result)) {
    result = result.replace("<svg", `<svg fill="${normalizeColor(color)}"`);
  }

  result = result
    .replace(/currentColor/gi, normalizeColor(color))
    .replace(/stroke="none"/gi, `stroke="${normalizeColor(color)}"`);

  if (!result.includes("fill=")) {
    result = result.replace("<svg", `<svg color="${normalizeColor(color)}"`);
  }

  return result;
}

function extractSvgInner(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*>/gi, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();
}

/** 배경 포함 SVG 문자열 생성 */
export function buildExportSvg(
  iconSvg: string,
  options: Pick<
    IconExportOptions,
    "iconColor" | "backgroundColor" | "transparentBackground" | "size"
  >
): string {
  const colored = applyIconColor(iconSvg, options.iconColor);
  const inner = extractSvgInner(colored);
  const viewBoxMatch = colored.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 24 24";

  if (options.transparentBackground) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="${viewBox}">${inner}</svg>`;
  }

  const pad = options.size * 0.12;
  const scale = (options.size - pad * 2) / 24;
  const bg = normalizeColor(options.backgroundColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${options.size} ${options.size}">
  <rect width="${options.size}" height="${options.size}" fill="${bg}"/>
  <g transform="translate(${pad}, ${pad}) scale(${scale})">${inner}</g>
</svg>`;
}

async function svgMarkupToPng(
  svgMarkup: string,
  size: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas를 사용할 수 없습니다."));
        return;
      }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) {
          reject(new Error("PNG 변환에 실패했습니다."));
          return;
        }
        resolve(new Uint8Array(await pngBlob.arrayBuffer()));
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG 렌더링에 실패했습니다."));
    };

    img.src = url;
  });
}

/** ICONDIR: reserved(0) + type=1(ICO) + imageCount */
function writeIcoHeader(imageCount: number): Uint8Array {
  const header = new Uint8Array(6);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, imageCount, true);
  return header;
}

/** ICONDIRENTRY for embedded PNG (wPlanes/wBitCount = 0) */
function writeIconDirEntry(
  size: number,
  dataLength: number,
  dataOffset: number
): Uint8Array {
  const entry = new Uint8Array(16);
  const entryView = new DataView(entry.buffer);
  entryView.setUint8(0, size >= 256 ? 0 : size);
  entryView.setUint8(1, size >= 256 ? 0 : size);
  entryView.setUint8(2, 0);
  entryView.setUint8(3, 0);
  entryView.setUint16(4, 0, true);
  entryView.setUint16(6, 0, true);
  entryView.setUint32(8, dataLength, true);
  entryView.setUint32(12, dataOffset, true);
  return entry;
}

function packIcoFile(images: { size: number; png: Uint8Array }[]): Blob {
  const header = writeIcoHeader(images.length);
  let dataOffset = 6 + 16 * images.length;
  const entries: Uint8Array[] = [];

  for (const { size, png } of images) {
    entries.push(writeIconDirEntry(size, png.length, dataOffset));
    dataOffset += png.length;
  }

  const total = dataOffset;
  const combined = new Uint8Array(total);
  combined.set(header, 0);
  let pos = 6;
  for (const entry of entries) {
    combined.set(entry, pos);
    pos += 16;
  }
  for (const { png } of images) {
    combined.set(png, pos);
    pos += png.length;
  }

  return new Blob([combined], { type: "image/vnd.microsoft.icon" });
}

export async function buildIcoBlob(
  renderSvgAtSize: (size: number) => string,
  sizes: number[]
): Promise<Blob> {
  const uniqueSizes = [...new Set(sizes)].sort((a, b) => a - b);
  if (uniqueSizes.length === 0) {
    throw new Error("ICO에 포함할 크기가 없습니다.");
  }

  const images: { size: number; png: Uint8Array }[] = [];

  for (const size of uniqueSizes) {
    const svg = renderSvgAtSize(size);
    images.push({ size, png: await svgMarkupToPng(svg, size) });
  }

  return packIcoFile(images);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const DOWNLOAD_STAGGER_MS = 180;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function downloadIconSvg(
  options: IconExportOptions,
  sizes: number[]
): Promise<void> {
  const uniqueSizes = [...new Set(sizes)].sort((a, b) => a - b);
  if (uniqueSizes.length === 0) {
    throw new Error("다운로드할 크기를 선택해 주세요.");
  }

  const raw = await fetchRawSvg(options.prefix, options.name);
  const base = {
    prefix: options.prefix,
    name: options.name,
    iconColor: options.iconColor,
    backgroundColor: options.backgroundColor,
    transparentBackground: options.transparentBackground,
  };

  for (let i = 0; i < uniqueSizes.length; i++) {
    const size = uniqueSizes[i];
    const svg = buildExportSvg(raw, { ...base, size });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const filename =
      uniqueSizes.length === 1
        ? `${options.name}.svg`
        : `${options.name}-${size}.svg`;
    downloadBlob(filename, blob);
    if (i < uniqueSizes.length - 1) {
      await delay(DOWNLOAD_STAGGER_MS);
    }
  }
}

export async function downloadIconIco(
  options: IconExportOptions,
  sizes: number[]
): Promise<void> {
  const uniqueSizes = [...new Set(sizes)].sort((a, b) => a - b);
  if (uniqueSizes.length === 0) {
    throw new Error("다운로드할 크기를 선택해 주세요.");
  }

  const raw = await fetchRawSvg(options.prefix, options.name);
  const base = {
    iconColor: options.iconColor,
    backgroundColor: options.backgroundColor,
    transparentBackground: options.transparentBackground,
  };
  const blob = await buildIcoBlob(
    (size) => buildExportSvg(raw, { ...base, size }),
    uniqueSizes
  );
  downloadBlob(`${options.name}.ico`, blob);
}

export function getPreviewIconUrl(
  prefix: string,
  name: string,
  color: string,
  size = 32
): string {
  const c = encodeURIComponent(normalizeColor(color));
  return `${ICONIFY_CDN}/${prefix}/${name}.svg?color=${c}&width=${size}&height=${size}`;
}
