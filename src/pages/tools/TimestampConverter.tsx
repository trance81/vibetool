import { useState, useEffect } from "react";
import { Copy, ArrowRightLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, fromUnixTime, getUnixTime, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TimestampConverter() {
  const [now, setNow] = useState(new Date());
  const [unixInput, setUnixInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("복사되었습니다.");
  };

  const handleUnixToDate = () => {
    try {
      const val = parseInt(unixInput);
      if (isNaN(val)) throw new Error("Invalid number");
      // Detect ms vs s (if > 2000000000 it's likely ms)
      const isMs = unixInput.length > 10;
      const date = isMs ? new Date(val) : fromUnixTime(val);
      setDateInput(format(date, "yyyy-MM-dd'T'HH:mm:ss"));
    } catch (e) {
      toast.error("올바른 Unix 타임스탬프를 입력하세요.");
    }
  };

  const handleDateToUnix = () => {
    try {
      const date = parseISO(dateInput);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      setUnixInput(getUnixTime(date).toString());
    } catch (e) {
      toast.error("올바른 날짜 형식을 입력하세요.");
    }
  };

  const unixNow = getUnixTime(now);

  return (
    <div className="space-y-8">
      {/* Current Time Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary animate-pulse">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">현재 시간 (로컬)</p>
              <p className="text-lg font-mono font-bold">{format(now, "yyyy-MM-dd HH:mm:ss")}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Unix 타임스탬프</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold">{unixNow}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(unixNow.toString())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Unix to Date */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unix-input">Unix 타임스탬프 → 날짜</Label>
            <div className="flex gap-2">
              <Input
                id="unix-input"
                placeholder="예: 1713933833"
                value={unixInput}
                onChange={(e) => setUnixInput(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleUnixToDate}>변환</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">10자리(초) 또는 13자리(밀리초) 자동 인식</p>
          </div>
        </div>

        {/* Date to Unix */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-input">날짜 → Unix 타임스탬프</Label>
            <div className="flex gap-2">
              <Input
                id="date-input"
                type="datetime-local"
                step="1"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleDateToUnix}>변환</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">브라우저 로컬 시간대 기준</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Results / Formats */}
      {dateInput && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
             { label: "ISO 8601", value: parseISO(dateInput).toISOString(), desc: "국제 표준" },
             { label: "UTC String", value: parseISO(dateInput).toUTCString(), desc: "협정 세계시" },
             { label: "Unix (Seconds)", value: getUnixTime(parseISO(dateInput)).toString(), desc: "초 단위" },
             { label: "Unix (Millis)", value: parseISO(dateInput).getTime().toString(), desc: "밀리초" },
             { label: "Locale Date", value: parseISO(dateInput).toLocaleDateString(), desc: "지역 날짜" },
             { label: "Locale Time", value: parseISO(dateInput).toLocaleTimeString(), desc: "지역 시간" },
           ].map((item) => (
             <Card key={item.label} className="border-border/40">
               <CardContent className="p-3 space-y-1">
                 <div className="flex justify-between items-start">
                   <div className="space-y-0.5">
                     <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.label}</span>
                     <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                   </div>
                   <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(item.value)}>
                     <Copy className="h-3 w-3" />
                   </Button>
                 </div>
                 <p className="text-xs font-mono font-medium truncate">{item.value}</p>
               </CardContent>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
