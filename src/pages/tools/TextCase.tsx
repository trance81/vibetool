import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as changeCase from "change-case";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function TextCase() {
  const [input, setInput] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다.");
  };

  const examples = [
    "hello world",
    "the quick brown fox",
    "Vibe Dev Tools is awesome",
    "USER_PROFILE_DATA"
  ];

  const handleRandomExample = () => {
    const random = examples[Math.floor(Math.random() * examples.length)];
    setInput(random);
  };

  const results = input ? [
    { label: "lowercase", value: input.toLowerCase() },
    { label: "UPPERCASE", value: input.toUpperCase() },
    { label: "Sentence case", value: input.charAt(0).toUpperCase() + input.slice(1).toLowerCase() },
    { label: "Title Case", value: changeCase.capitalCase(input) },
    { label: "camelCase", value: changeCase.camelCase(input) },
    { label: "PascalCase", value: changeCase.pascalCase(input) },
    { label: "snake_case", value: changeCase.snakeCase(input) },
    { label: "kebab-case", value: changeCase.kebabCase(input) },
    { label: "CONSTANT_CASE", value: changeCase.constantCase(input) },
    { label: "dot.case", value: changeCase.dotCase(input) },
    { label: "path/case", value: changeCase.pathCase(input) },
    { label: "tOGGLE cASE", value: input.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="input">텍스트 입력</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" onClick={handleRandomExample}>
              <RefreshCw className="h-3 w-3 mr-1" /> 예시 채우기
            </Button>
            <Button variant="outline" size="xs" onClick={() => setInput("")}>초기화</Button>
          </div>
        </div>
        <Textarea
          id="input"
          placeholder="변환할 텍스트를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      {input && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res) => (
            <Card key={res.label} className="overflow-hidden border-border/40">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{res.label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(res.value)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-3 font-mono text-sm break-all select-all">
                  {res.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
