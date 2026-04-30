import { useState, useEffect } from "react";
import { Copy, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Alignment = "left" | "center" | "right";

interface TableData {
  headers: string[];
  alignments: Alignment[];
  rows: string[][];
}

export function MarkdownTable() {
  const [data, setData] = useState<TableData>({
    headers: ["Header 1", "Header 2", "Header 3"],
    alignments: ["left", "center", "right"],
    rows: [
      ["Cell 1-1", "Cell 1-2", "Cell 1-3"],
      ["Cell 2-1", "Cell 2-2", "Cell 2-3"],
    ],
  });

  const addRow = () => {
    setData((prev) => ({
      ...prev,
      rows: [...prev.rows, Array(prev.headers.length).fill("")],
    }));
  };

  const removeRow = (idx: number) => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== idx),
    }));
  };

  const addColumn = () => {
    setData((prev) => ({
      headers: [...prev.headers, `Header ${prev.headers.length + 1}`],
      alignments: [...prev.alignments, "left"],
      rows: prev.rows.map((r) => [...r, ""]),
    }));
  };

  const removeColumn = (idx: number) => {
    if (data.headers.length <= 1) return;
    setData((prev) => ({
      headers: prev.headers.filter((_, i) => i !== idx),
      alignments: prev.alignments.filter((_, i) => i !== idx),
      rows: prev.rows.map((r) => r.filter((_, i) => i !== idx)),
    }));
  };

  const updateHeader = (val: string, idx: number) => {
    const nextHeaders = [...data.headers];
    nextHeaders[idx] = val;
    setData((prev) => ({ ...prev, headers: nextHeaders }));
  };

  const updateCell = (val: string, rIdx: number, cIdx: number) => {
    const nextRows = [...data.rows];
    nextRows[rIdx] = [...nextRows[rIdx]];
    nextRows[rIdx][cIdx] = val;
    setData((prev) => ({ ...prev, rows: nextRows }));
  };

  const updateAlignment = (val: Alignment, idx: number) => {
    const nextAligns = [...data.alignments];
    nextAligns[idx] = val;
    setData((prev) => ({ ...prev, alignments: nextAligns }));
  };

  const generateMarkdown = () => {
    const headerRow = `| ${data.headers.join(" | ")} |`;
    const separatorRow = `| ${data.alignments
      .map((a) => {
        if (a === "left") return ":---";
        if (a === "center") return ":---:";
        return "---:";
      })
      .join(" | ")} |`;
    const dataRows = data.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  };

  const markdown = generateMarkdown();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border">
        <div className="flex gap-2">
          <Button size="xs" variant="outline" onClick={addColumn}>
            <Plus className="h-3 w-3 mr-1" /> 열 추가
          </Button>
          <Button size="xs" variant="outline" onClick={addRow}>
            <Plus className="h-3 w-3 mr-1" /> 행 추가
          </Button>
        </div>
        <Button size="xs" onClick={() => {
          navigator.clipboard.writeText(markdown);
          toast.success("마크다운이 복사되었습니다.");
        }}>
          <Copy className="h-3 w-3 mr-1" /> 전체 복사
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="editor" className="text-xs">편집기</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">미리보기</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="pt-4 overflow-x-auto">
          <div className="min-w-[600px] border rounded-lg overflow-hidden">
             <table className="w-full text-sm">
               <thead className="bg-muted/50 border-b">
                 <tr>
                    {data.headers.map((h, i) => (
                      <th key={i} className="p-2 border-r last:border-0 font-medium">
                        <div className="flex flex-col gap-2">
                          <Input 
                            value={h} 
                            onChange={(e) => updateHeader(e.target.value, i)}
                            className="h-8 text-[11px] font-bold"
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                               <Button 
                                variant={data.alignments[i] === "left" ? "secondary" : "ghost"} 
                                size="icon" className="h-5 w-5"
                                onClick={() => updateAlignment("left", i)}
                               ><AlignLeft className="h-3 w-3" /></Button>
                               <Button 
                                variant={data.alignments[i] === "center" ? "secondary" : "ghost"} 
                                size="icon" className="h-5 w-5"
                                onClick={() => updateAlignment("center", i)}
                               ><AlignCenter className="h-3 w-3" /></Button>
                               <Button 
                                variant={data.alignments[i] === "right" ? "secondary" : "ghost"} 
                                size="icon" className="h-5 w-5"
                                onClick={() => updateAlignment("right", i)}
                               ><AlignRight className="h-3 w-3" /></Button>
                            </div>
                            <Button 
                              variant="ghost" size="icon" className="h-5 w-5 text-destructive"
                              onClick={() => removeColumn(i)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="w-10"></th>
                 </tr>
               </thead>
               <tbody>
                  {data.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-1 border-r last:border-0 align-top">
                          <Input 
                            value={cell} 
                            onChange={(e) => updateCell(e.target.value, rIdx, cIdx)}
                            className="border-0 shadow-none focus-visible:ring-1 text-[11px] h-8"
                          />
                        </td>
                      ))}
                      <td className="p-1 text-center">
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => removeRow(rIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4 space-y-4">
           <Card className="border-border/60">
             <div className="p-4 bg-muted/10">
               <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">{markdown}</pre>
             </div>
           </Card>
           
           <div className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="border-b bg-muted/20">
                    {data.headers.map((h, i) => (
                      <th key={i} className="border p-2 text-left" style={{ textAlign: data.alignments[i] }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border p-2" style={{ textAlign: data.alignments[cIdx] }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-[10px] text-muted-foreground text-center italic">
        실시간으로 마크다운 문법이 생성됩니다. `|` 기호와 `-` 기호를 수동으로 맞출 필요가 없습니다.
      </p>
    </div>
  );
}
