import { useState } from "react";
import { Link, Copy, ExternalLink, History, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShortenHistory {
  original: string;
  short: string;
  date: string;
}

export function UrlShortener() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ShortenHistory[]>(() => {
    const saved = localStorage.getItem("vibe-tools:url-shortener:history");
    return saved ? JSON.parse(saved) : [];
  });

  const handleShorten = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      if (data.shorturl) {
        const item: ShortenHistory = {
          original: url,
          short: data.shorturl,
          date: new Date().toLocaleString(),
        };
        const newHistory = [item, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("vibe-tools:url-shortener:history", JSON.stringify(newHistory));
        toast.success("URL이 단축되었습니다!");
        setUrl("");
      } else {
        throw new Error(data.error || "Failed to shorten");
      }
    } catch (e) {
      toast.error("URL 단축에 실패했습니다. 유효한 URL인지 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("복사되었습니다.");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("vibe-tools:url-shortener:history");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="url">단축할 URL 입력</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              placeholder="https://example.com/very-long-url-path..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-11"
            />
            <Button className="h-11 px-6 shadow-lg" onClick={handleShorten} disabled={loading}>
              {loading ? "생성 중..." : "단축하기"}
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <Link className="h-2.5 w-2.5" /> is.gd 서비스를 통해 단축됩니다.
            </p>
            <p className="text-[10px] text-primary/80 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 사용자의 어떠한 정보도 저장하거나 추적하지 않는 안전한 서비스입니다.
            </p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 tracking-tight">
              <History className="h-4 w-4" /> 최근 생성 기록
            </h3>
            <Button variant="ghost" size="xs" onClick={clearHistory} className="text-destructive hover:text-destructive text-[11px]">
              <Trash2 className="h-3 w-3 mr-1" /> 전체 삭제
            </Button>
          </div>
          
          <div className="grid gap-3">
            {history.map((item, idx) => (
              <Card key={idx} className="border-border/40 hover:border-primary/20 transition-all shadow-sm">
                <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{item.original}</p>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="text-sm font-bold font-mono text-primary">{item.short}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => copyToClipboard(item.short)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> 복사
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-xs" asChild>
                      <a href={item.short} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> 이동
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
