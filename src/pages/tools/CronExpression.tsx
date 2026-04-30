import { useState, useMemo } from "react";
import { Copy, Info, Play, List } from "lucide-react";
import { toast } from "sonner";
import cronstrue from "cronstrue";
import "cronstrue/locales/ko";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getNextRuns(expression: string, count = 5): Date[] {
  const now = new Date();
  const runs: Date[] = [];

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return runs;

  const [minuteStr, hourStr, dayStr, monthStr, dowStr] = parts;

  function expandField(field: string, min: number, max: number): number[] {
    if (field === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    const values = new Set<number>();
    const tokens = field.split(',');

    for (const token of tokens) {
      if (token.includes('/')) {
        const [baseStr, stepStr] = token.split('/');
        const step = parseInt(stepStr, 10);
        const base = baseStr === '*' ? min : parseInt(baseStr, 10);
        for (let i = base; i <= max; i += step) {
          if (i >= min) values.add(i);
        }
      } else if (token.includes('-')) {
        const [start, end] = token.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          values.add(i);
        }
      } else {
        values.add(parseInt(token, 10));
      }
    }

    return Array.from(values).sort((a, b) => a - b);
  }

  const minutes = expandField(minuteStr, 0, 59);
  const hours = expandField(hourStr, 0, 23);
  const days = expandField(dayStr, 1, 31);
  const months = expandField(monthStr, 1, 12);
  const dows = expandField(dowStr, 0, 6);

  const current = new Date(now);
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  while (runs.length < count) {
    const month = current.getMonth() + 1;
    const day = current.getDate();
    const hour = current.getHours();
    const minute = current.getMinutes();
    const dow = current.getDay();

    if (months.includes(month) &&
        days.includes(day) &&
        hours.includes(hour) &&
        minutes.includes(minute) &&
        dows.includes(dow)) {
      runs.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);

    if (current.getTime() > now.getTime() + 366 * 24 * 60 * 60 * 1000) {
      break;
    }
  }

  return runs;
}

export function CronExpression() {
  const [expression, setExpression] = useState("* * * * *");

  const description = useMemo(() => {
    try {
      return cronstrue.toString(expression, { locale: "ko" });
    } catch (e) {
      return "올바른 크론 표현식을 입력하세요.";
    }
  }, [expression]);

  const nextRuns = useMemo(() => {
    try {
      const runs = getNextRuns(expression, 5);
      return runs.map(d => d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    } catch (e) {
      return [];
    }
  }, [expression]);

  const presets = [
    { label: "매분", val: "* * * * *" },
    { label: "매시 정각", val: "0 * * * *" },
    { label: "매일 자정", val: "0 0 * * *" },
    { label: "매일 오전 9시", val: "0 9 * * *" },
    { label: "평일 오전 9시", val: "0 9 * * 1-5" },
    { label: "매월 1일", val: "0 0 1 * *" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cron-expr">크론 표현식</Label>
          <div className="flex gap-2">
            <Input
              id="cron-expr"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="font-mono text-lg"
              placeholder="* * * * *"
            />
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(expression);
              toast.success("표현식이 복사되었습니다.");
            }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <Button key={p.label} variant="secondary" size="xs" onClick={() => setExpression(p.val)}>
                {p.label}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-right">
            순서: 분 시 일 월 요일
          </p>
        </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">해석 결과</p>
            <p className="text-lg font-bold tracking-tight">{description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Play className="h-4 w-4" /> 다음 실행 시간
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {nextRuns.length > 0 ? nextRuns.map((run, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b last:border-0 border-border/50">
                <span className="text-muted-foreground">{i + 1}.</span>
                <span>{run}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">유효하지 않은 표현식입니다.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <List className="h-4 w-4" /> 문법 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {/* 기본 특수문자 */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
              <div><code className="bg-muted px-1 rounded">*</code> 모든 값</div>
              <div><code className="bg-muted px-1 rounded">?</code> 값 없음</div>
              <div><code className="bg-muted px-1 rounded">,</code> 목록</div>
              <div><code className="bg-muted px-1 rounded">-</code> 범위</div>
              <div><code className="bg-muted px-1 rounded">/</code> 간격</div>
              <div><code className="bg-muted px-1 rounded">L</code> 마지막 일/요일</div>
              <div><code className="bg-muted px-1 rounded">W</code> 가장 가까운 평일</div>
              <div><code className="bg-muted px-1 rounded">#</code> 몇째 주 요일</div>
            </div>

            {/* 필드 정보 */}
            <div className="border-t pt-2">
              <p className="text-[11px] font-bold text-muted-foreground mb-1">필드 정보 (5-필드 기준)</p>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px]">
                <div className="font-semibold">필드</div>
                <div className="font-semibold">허용 범위</div>
                <div className="font-semibold">허용 특수문자</div>
                <div>분</div>
                <div>0 ~ 59</div>
                <div>*, -, /</div>
                <div>시</div>
                <div>0 ~ 23</div>
                <div>*, -, /</div>
                <div>일</div>
                <div>1 ~ 31</div>
                <div>*, -, ?, /, L, W</div>
                <div>월</div>
                <div>1 ~ 12</div>
                <div>*, -, /</div>
                <div>요일</div>
                <div>0 ~ 6 (SUN~SAT)</div>
                <div>*, -, ?, /, L, #</div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">* 본 도구는 5-필드 크론 표현식(분, 시, 일, 월, 요일)을 사용합니다.</p>
            </div>

            {/* 특수문자 상세 의미 */}
            <div className="border-t pt-2">
              <p className="text-[11px] font-bold text-muted-foreground mb-1">특수문자 상세 설명</p>
              <div className="space-y-1 text-[10px]">
                <div><code className="bg-muted px-1 rounded">*</code> 모든 값을 의미</div>
                <div><code className="bg-muted px-1 rounded">?</code> 특정 값이 없음 (일/요일 필드 중 하나만 사용)</div>
                <div><code className="bg-muted px-1 rounded">-</code> 범위 지정 (예: 1-5 → 1,2,3,4,5)</div>
                <div><code className="bg-muted px-1 rounded">,</code> 값 목록 (예: MON,WED,FRI)</div>
                <div><code className="bg-muted px-1 rounded">/</code> 시작시간/간격 (예: 0/5 → 0분부터 매 5분)</div>
                <div><code className="bg-muted px-1 rounded">L</code> 마지막 일/요일 (일: 월 마지막 날, 요일: 토요일)</div>
                <div><code className="bg-muted px-1 rounded">W</code> 가장 가까운 평일 (예: 15W → 15일 근처 평일)</div>
                <div><code className="bg-muted px-1 rounded">#</code> 몇째 주 요일 (예: 3#2 → 2번째 주 수요일)</div>
              </div>
            </div>

            {/* 예시 표현식 */}
            <div className="border-t pt-2">
              <p className="text-[11px] font-bold text-muted-foreground mb-1">예시 표현식</p>
              <div className="space-y-1 text-[10px] font-mono">
                <div><code className="bg-muted px-1 rounded">* * * * *</code> 매분</div>
                <div><code className="bg-muted px-1 rounded">0 0/5 * * *</code> 매 5분마다</div>
                <div><code className="bg-muted px-1 rounded">0 9 * * 1-5</code> 평일 오전 9시</div>
                <div><code className="bg-muted px-1 rounded">0 15 10 ? * 6#3</code> 매월 셋째주 금요일 10시 15분</div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
