import { useState, useEffect } from "react";
import { Copy, RefreshCw, Palette, Layers, Grid, Pipette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper functions for color conversion
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export function ColorPalette() {
  const [color, setColor] = useState("#6366f1");
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });

  useEffect(() => {
    const newRgb = hexToRgb(color);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  }, [color]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text} 복사 완료!`);
  };

  const getHarmonies = () => {
    const { h, s, l } = hsl;
    return [
      { name: "보색", type: "Complementary", hex: hslToHex((h + 180) % 360, s, l), desc: "색상환의 반대편 색상" },
      { name: "유사색 1", type: "Analogous", hex: hslToHex((h + 30) % 360, s, l), desc: "인접한 따뜻한 색상" },
      { name: "유사색 2", type: "Analogous", hex: hslToHex((h - 30 + 360) % 360, s, l), desc: "인접한 차가운 색상" },
      { name: "삼보색 1", type: "Triadic", hex: hslToHex((h + 120) % 360, s, l), desc: "균형 잡힌 대비 색상" },
      { name: "삼보색 2", type: "Triadic", hex: hslToHex((h + 240) % 360, s, l), desc: "다채로운 조합 색상" },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Color Picker & Values */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="overflow-hidden border-border/40 shadow-xl bg-card/50 sticky top-6">
          <CardContent className="p-0">
            <div 
              className="h-48 w-full transition-colors duration-300 relative group"
              style={{ backgroundColor: color }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(color)}>
                  HEX 복사
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="color-picker" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Pipette className="h-3 w-3" /> 색상 선택
                  </Label>
                  <div className="flex gap-2">
                    <div className="w-12 h-10 rounded border border-border overflow-hidden shrink-0 shadow-inner">
                      <input 
                        id="color-picker"
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      />
                    </div>
                    <Input 
                      value={color.toUpperCase()} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                          setColor(val);
                        }
                      }}
                      className="font-mono font-bold h-10 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Copy className="h-3 w-3" /> Quick Copy
                </div>
                {[
                  { label: "HEX (대문자)", value: color.toUpperCase() },
                  { label: "HEX (소문자)", value: color.toLowerCase() },
                  { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
                  { label: "RGBA", value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
                  { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
                  { label: "HSLA", value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
                ].map((fmt, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/20 group hover:bg-muted/40 transition-colors">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[8px] font-bold text-muted-foreground uppercase">{fmt.label}</div>
                      <div className="text-[11px] font-mono font-bold truncate">{fmt.value}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 group-hover:opacity-100" onClick={() => copyToClipboard(fmt.value)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Harmonies */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" /> 추천 배색 가이드
            </h3>
            <p className="text-xs text-muted-foreground">선택한 색상과 어울리는 다양한 조합을 제안합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getHarmonies().map((h, i) => (
            <Card key={i} className="group border-border/40 bg-card/30 hover:border-primary/30 transition-all shadow-sm overflow-hidden">
              <div 
                className="h-24 w-full cursor-pointer transition-transform group-hover:scale-[1.02] relative"
                style={{ backgroundColor: h.hex }}
                onClick={() => setColor(h.hex)}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px]">
                   <span className="text-[10px] font-bold bg-background/80 px-2 py-1 rounded shadow-sm">색상 적용하기</span>
                </div>
              </div>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{h.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-mono">{h.type}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">{h.hex}</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(h.hex);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-3">
          <div className="text-[11px] font-bold text-foreground italic flex items-center gap-2">
             💡 디자인 팁
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>보색</strong>은 강렬한 대비가 필요할 때(버튼, 알림) 적합하며, <strong>유사색</strong>은 전체적인 디자인의 통일감과 편안함을 줄 때 사용하면 좋습니다. <strong>삼보색</strong>은 보다 활기차고 균형 잡힌 다채로운 UI를 구성하는 데 유용합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
