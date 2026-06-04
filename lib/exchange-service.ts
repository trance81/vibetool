import axios from "axios";

export type ExchangeRateResult = {
  rate: number;
  date: string;
  source: string;
};

export const FALLBACK_CURRENCIES: Record<string, string> = {
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Renminbi",
  CZK: "Czech Koruna",
  DKK: "Danish Krone",
  EUR: "Euro",
  GBP: "British Pound",
  HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  INR: "Indian Rupee",
  ISK: "Icelandic Króna",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PHP: "Philippine Peso",
  PLN: "Polish Złoty",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  USD: "United States Dollar",
  ZAR: "South African Rand",
};

const REQUEST_TIMEOUT_MS = 10_000;

function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

async function fetchFrankfurter(
  from: string,
  to: string
): Promise<ExchangeRateResult> {
  const response = await axios.get("https://api.frankfurter.app/latest", {
    params: { from, to },
    timeout: REQUEST_TIMEOUT_MS,
  });
  const rate = response.data?.rates?.[to];
  if (typeof rate !== "number") throw new Error("Frankfurter: missing rate");
  return {
    rate,
    date: response.data.date ?? new Date().toISOString().slice(0, 10),
    source: "frankfurter",
  };
}

async function fetchOpenErApi(
  from: string,
  to: string
): Promise<ExchangeRateResult> {
  const response = await axios.get(
    `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  if (response.data?.result !== "success") {
    throw new Error("open.er-api: unsuccessful");
  }
  const rate = response.data?.rates?.[to];
  if (typeof rate !== "number") throw new Error("open.er-api: missing rate");
  const date =
    typeof response.data?.time_last_update_utc === "string"
      ? response.data.time_last_update_utc.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  return { rate, date, source: "open.er-api" };
}

async function fetchJsDelivr(
  from: string,
  to: string
): Promise<ExchangeRateResult> {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  const response = await axios.get(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  const rate = response.data?.[fromLower]?.[toLower];
  if (typeof rate !== "number") throw new Error("jsDelivr: missing rate");
  const date =
    typeof response.data?.date === "string"
      ? response.data.date
      : new Date().toISOString().slice(0, 10);
  return { rate, date, source: "currency-api" };
}

export async function getExchangeRate(
  from: string,
  to: string
): Promise<ExchangeRateResult> {
  const base = from.toUpperCase();
  const quote = to.toUpperCase();

  if (!isValidCurrencyCode(base) || !isValidCurrencyCode(quote)) {
    throw new Error("Invalid currency code");
  }

  if (base === quote) {
    return {
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      source: "identity",
    };
  }

  const providers = [fetchFrankfurter, fetchOpenErApi, fetchJsDelivr];
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      return await provider(base, quote);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(message);
    }
  }

  throw new Error(errors.join("; ") || "All exchange providers failed");
}

export async function getCurrencies(): Promise<Record<string, string>> {
  try {
    const response = await axios.get(
      "https://api.frankfurter.app/currencies",
      { timeout: REQUEST_TIMEOUT_MS }
    );
    if (response.data && typeof response.data === "object") {
      return response.data as Record<string, string>;
    }
  } catch {
    /* fall through */
  }

  try {
    const response = await axios.get(
      "https://open.er-api.com/v6/latest/USD",
      { timeout: REQUEST_TIMEOUT_MS }
    );
    const rates = response.data?.rates;
    if (rates && typeof rates === "object") {
      const codes = Object.keys(rates);
      return Object.fromEntries(
        codes.map((code) => [
          code,
          FALLBACK_CURRENCIES[code] ?? code,
        ])
      );
    }
  } catch {
    /* fall through */
  }

  return { ...FALLBACK_CURRENCIES };
}
