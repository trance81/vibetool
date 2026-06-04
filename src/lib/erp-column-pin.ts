/** SHA-256 of access code (not stored in plain text) */
const ACCESS_HASH =
  "12b408838e33f12bf8886792e6d44de0d9623e2bbf833b70f9f2e13fdf802706";

const LEGACY_SESSION_KEY = "vibe-tools:erp-column:unlock";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Remove legacy session unlock flag (no longer used). */
export function clearLegacyErpColumnSession(): void {
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function verifyErpColumnPin(pin: string): Promise<boolean> {
  const hash = await sha256Hex(pin.trim());
  return hash === ACCESS_HASH;
}
