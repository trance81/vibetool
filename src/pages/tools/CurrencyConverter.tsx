import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Copy, Info, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POPULAR_CURRENCIES = [
  "KRW",
  "USD",
  "EUR",
  "JPY",
  "CNY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "THB",
] as const;

const CURRENCY_LABELS: Record<string, string> = {
  KRW: "대한민국 원 (KRW)",
  USD: "미국 달러 (USD)",
  EUR: "유로 (EUR)",
  JPY: "일본 엔 (JPY)",
  CNY: "중국 위안 (CNY)",
  GBP: "영국 파운드 (GBP)",
  AUD: "호주 달러 (AUD)",
  CAD: "캐나다 달러 (CAD)",
  CHF: "스위스 프랑 (CHF)",
  HKD: "홍콩 달러 (HKD)",
  SGD: "싱가포르 달러 (SGD)",
  THB: "태국 바트 (THB)",
};

type RatesResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

function formatAmount(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 2,
    }).format(value);
  }
}

function formatRate(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 6,
  }).format(value);
}

function currencyLabel(code: string, names?: Record<string, string>): string {
  if (CURRENCY_LABELS[code]) return CURRENCY_LABELS[code];
  const en = names?.[code];
  return en ? `${en} (${code})` : code;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("KRW");
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currencyNames, setCurrencyNames] = useState<Record<string, string>>({});
  const [availableCodes, setAvailableCodes] = useState<string[]>([
    ...POPULAR_CURRENCIES,
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("복사되었습니다.");
  };

  useEffect(() => {
    fetch("/api/exchange/currencies")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: Record<string, string>) => {
        setCurrencyNames(data);
        setAvailableCodes(
          Object.keys(data).sort((a, b) => a.localeCompare(b))
        );
      })
      .catch(() => {
        toast.error("통화 목록을 불러오지 못했습니다.");
      });
  }, []);

  const fetchRate = useCallback(async () => {
    if (from === to) {
      setRate(1);
      setRateDate(new Date().toISOString().slice(0, 10));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/exchange/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      if (!res.ok) throw new Error("fetch failed");
      const data: RatesResponse = await res.json();
      const nextRate = data.rates[to];
      if (nextRate == null) throw new Error("missing rate");
      setRate(nextRate);
      setRateDate(data.date);
    } catch {
      toast.error("환율 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [amount]);

  const converted = useMemo(() => {
    if (parsedAmount == null || rate == null) return null;
    return parsedAmount * rate;
  }, [parsedAmount, rate]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  const sortedCodes = useMemo(() => {
    const popular = POPULAR_CURRENCIES.filter((c) =>
      availableCodes.includes(c)
    );
    const rest = availableCodes.filter(
      (c) => !POPULAR_CURRENCIES.includes(c as (typeof POPULAR_CURRENCIES)[number])
    );
    return [...popular, ...rest];
  }, [availableCodes]);

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                기준 환율
              </p>
              <p className="text-sm font-mono font-bold">
                {loading
                  ? "불러오는 중…"
                  : rate != null
                    ? `1 ${from} = ${formatRate(rate)} ${to}`
                    : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {rateDate && <span>ECB 기준 · {rateDate}</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRate}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">금액</Label>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="예: 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono text-lg h-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="space-y-2">
            <Label>보내는 통화</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {sortedCodes.map((code) => (
                  <SelectItem key={`from-${code}`} value={code}>
                    {currencyLabel(code, currencyNames)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 mx-auto md:mb-0"
            onClick={swapCurrencies}
            aria-label="통화 교환"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <Label>받는 통화</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {sortedCodes.map((code) => (
                  <SelectItem key={`to-${code}`} value={code}>
                    {currencyLabel(code, currencyNames)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            변환 결과
          </p>
          {parsedAmount == null ? (
            <p className="text-sm text-muted-foreground">
              올바른 금액을 입력해 주세요.
            </p>
          ) : converted != null ? (
            <>
              <p className="text-3xl font-bold font-mono tracking-tight">
                {formatAmount(converted, to)}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {formatAmount(parsedAmount, from)} → {formatAmount(converted, to)}
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      converted.toLocaleString("en-US", {
                        maximumFractionDigits: 8,
                      })
                    )
                  }
                >
                  <Copy className="h-3 w-3 mr-1" />
                  숫자만 복사
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `${formatAmount(parsedAmount, from)} = ${formatAmount(converted, to)} (${rateDate ?? "오늘"} 기준)`
                    )
                  }
                >
                  <Copy className="h-3 w-3 mr-1" />
                  문장 복사
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">환율을 불러오는 중…</p>
          )}
        </CardContent>
      </Card>

      <div
        role="note"
        className="flex gap-3 rounded-lg border border-amber-400/45 bg-amber-500/20 px-4 py-4 text-base leading-relaxed text-amber-50"
      >
        <Info
          className="h-5 w-5 shrink-0 text-amber-200 mt-0.5"
          aria-hidden
        />
        <p>
          <span className="font-semibold text-white">
            환율 데이터 안내
          </span>
          <span className="block mt-1.5 text-amber-50/95">
            환율 데이터는{" "}
            <a
              href="https://www.frankfurter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-100 underline decoration-amber-300/70 underline-offset-2 hover:text-white"
            >
              Frankfurter
            </a>
            (ECB·공개 시세)를 사용합니다.{" "}
            <strong className="font-semibold text-white">
              실제 은행·카드 환전 시 적용되는 환율과 다를 수 있습니다.
            </strong>
          </span>
        </p>
      </div>
    </div>
  );
}
