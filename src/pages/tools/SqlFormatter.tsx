import { useState } from "react";
import { Copy, RefreshCw, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<any>("postgresql");
  const [indent, setIndent] = useState("2");
  const [uppercase, setUppercase] = useState("true");

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const formatted = format(input, {
        language: dialect,
        tabWidth: parseInt(indent),
        keywordCase: uppercase === "true" ? "upper" : "lower",
      });
      setInput(formatted);
      toast.success("포맷팅이 완료되었습니다.");
    } catch (e) {
      toast.error("SQL 문법에 오류가 있습니다.");
    }
  };

  const handleExample = () => {
    setInput(`SELECT users.id, users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = 'completed' GROUP BY users.id HAVING SUM(orders.amount) > 1000 ORDER BY orders.amount DESC LIMIT 10`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold">언어 (Dialect)</Label>
          <Select value={dialect} onValueChange={setDialect}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sql">Standard SQL</SelectItem>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="mariadb">MariaDB</SelectItem>
              <SelectItem value="sqlite">SQLite</SelectItem>
              <SelectItem value="tsql">TSQL (SQL Server)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold">들여쓰기</Label>
          <Select value={indent} onValueChange={setIndent}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Spaces</SelectItem>
              <SelectItem value="4">4 Spaces</SelectItem>
              <SelectItem value="8">8 Spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground font-bold">키워드 대소문자</Label>
          <Select value={uppercase} onValueChange={setUppercase}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">UPPERCASE</SelectItem>
              <SelectItem value="false">lowercase</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 relative">
        <div className="flex justify-between items-center px-1">
          <Label>SQL 쿼리</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" onClick={handleExample}>예시</Button>
            <Button variant="outline" size="xs" onClick={() => setInput("")}>초기화</Button>
          </div>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="여기에 SQL 쿼리를 입력하세요..."
          className="min-h-[400px] font-mono text-sm leading-relaxed resize-y"
        />
        
        <div className="absolute bottom-4 right-4 flex gap-2">
           <Button size="sm" variant="secondary" onClick={() => {
             navigator.clipboard.writeText(input);
             toast.success("SQL이 복사되었습니다.");
           }}>
            <Copy className="h-4 w-4 mr-2" /> 복사
          </Button>
          <Button size="sm" onClick={handleFormat}>
            <AlignLeft className="h-4 w-4 mr-2" /> 정렬하기
          </Button>
        </div>
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center">
        `sql-formatter` 라이브러리를 사용합니다. 복잡한 서브쿼리와 조인 문법도 지원합니다.
      </p>
    </div>
  );
}
