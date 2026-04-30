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
      { name: "보색 (Complementary)", hex: hslToHex((h + 180) % 360, s, l) },
      { name: "유사색 (Analogous) 1", hex: hslToHex((h + 30) % 360, s, l) },
      { name: "유사색 (Analogous) 2", hex: hslToHex((h - 30 + 360) % 360, s, l) },
      { name: "삼보색 (Triadic) 1", hex: hslToHex((h + 120) % 360, s, l) },
      { name: "삼보색 (Triadic) 2", hex: hslToHex((h + 240) % 360, s, l) },
    ];
  };

  const getShades = () => {
    const { h, s } = hsl;
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(lightness => ({
      l: lightness,
      hex: hslToHex(h, s, lightness)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Color Picker & Values */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="overflow-hidden border-border/40 shadow-xl bg-card/50">
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
                    <div className="w-12 h-10 rounded border border-border overflow-hidden shrink-0">
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
                      className="font-mono font-bold h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase">RGB</div>
                    <div className="text-sm font-mono font-bold">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase">HSL</div>
                    <div className="text-sm font-mono font-bold">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Harmonies & Themes */}
      <div className="lg:col-span-7 space-y-6">
        <Tabs defaultValue="harmony" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/40 p-1 border border-border/40">
            <TabsTrigger value="harmony" className="gap-2 font-bold text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> 배색 가이드
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2 font-bold text-xs">
              <Layers className="h-3.5 w-3.5" /> 테마 파레트
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="harmony" className="mt-6 space-y-4">
            <div className="grid gap-3">
              {getHarmonies().map((h, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div 
                    className="w-16 h-16 rounded-xl border border-border shadow-sm shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: h.hex }}
                    onClick={() => setColor(h.hex)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground mb-0.5">{h.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{h.hex}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(h.hex)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="theme" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Grid className="h-3.5 w-3.5" /> 명도 단계 (Shades & Tints)
              </div>
              <div className="grid grid-cols-9 gap-2">
                {getShades().map((s, i) => (
                  <div key={i} className="space-y-2 text-center group">
                    <div 
                      className="aspect-square rounded-lg border border-border/40 shadow-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
                      style={{ backgroundColor: s.hex }}
                      onClick={() => setColor(s.hex)}
                      title={`${s.hex} (L: ${s.l}%)`}
                    />
                    <div className="text-[9px] font-mono text-muted-foreground font-bold opacity-0 group-hover:opacity-100">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-muted/20 border-dashed border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="text-[11px] font-bold text-foreground italic flex items-center gap-2">
                   🎨 디자인 팁
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  선택한 색상을 메인 브랜드 컬러로 사용할 때, 보색은 <strong>강조 버튼</strong>이나 <strong>알림</strong>에 사용하고, 명도 단계는 <strong>배경색</strong>이나 <strong>경계선</strong> 설정 시 유용합니다.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
