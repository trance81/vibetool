import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Download, Upload, QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

export function QrGenerator() {
  const [data, setData] = useState("https://github.com");
  const [dotsType, setDotsType] = useState<DotType>("square");
  const [cornersType, setCornersType] = useState<CornerSquareType>("square");
  const [dotColor, setDotColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState(300);

  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCode] = useState(new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg" as DrawType,
    data: data,
    dotsOptions: { color: dotColor, type: dotsType },
    backgroundOptions: { color: bgColor },
    cornersSquareOptions: { type: cornersType },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10 }
  }));

  useEffect(() => {
    if (qrRef.current) {
      qrCode.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    qrCode.update({
      data: data,
      dotsOptions: { color: dotColor, type: dotsType },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornersType },
      image: image || undefined,
      width: size,
      height: size,
    });
  }, [data, dotsType, cornersType, dotColor, bgColor, image, size]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (ext: "png" | "svg" | "webp") => {
    qrCode.download({ name: "vibe-qr", extension: ext });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qr-data">QR 데이터 (URL 또는 텍스트)</Label>
          <Textarea 
            id="qr-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="여기에 링크나 텍스트를 입력하세요..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>점 스타일</Label>
            <Select value={dotsType} onValueChange={(v: DotType) => setDotsType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                <SelectItem value="classy">Classy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>코너 스타일</Label>
            <Select value={cornersType} onValueChange={(v: CornerSquareType) => setCornersType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>점 색상</Label>
            <div className="flex gap-2">
              <Input type="color" value={dotColor} onChange={(e) => setDotColor(e.target.value)} className="w-12 p-1" />
              <Input type="text" value={dotColor} onChange={(e) => setDotColor(e.target.value)} className="flex-1 font-mono text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>배경 색상</Label>
            <div className="flex gap-2">
              <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 p-1" />
              <Input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 font-mono text-xs" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>중앙 로고 이미지 (선택)</Label>
          <div className="flex gap-2">
            <Input type="file" accept="image/*" onChange={onImageChange} className="text-xs" />
            {image && <Button variant="outline" size="xs" onClick={() => setImage(null)}>제거</Button>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <Label>출력 크기: {size}px</Label>
          </div>
          <Slider value={[size]} min={200} max={1000} step={50} onValueChange={(v) => setSize(v[0])} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-muted/20 min-h-[400px] relative">
        <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-xl mb-8" />
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={() => handleDownload("png")}>
            <Download className="h-4 w-4 mr-2" /> PNG
          </Button>
          <Button variant="secondary" onClick={() => handleDownload("svg")}>
            <Download className="h-4 w-4 mr-2" /> SVG
          </Button>
          <Button variant="outline" onClick={() => handleDownload("webp")}>
            <Download className="h-4 w-4 mr-2" /> WebP
          </Button>
        </div>
        
        <p className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1">
          <QrIcon className="h-3 w-3" /> 고해상도 QR 코드가 브라우저에서 즉시 생성됩니다.
        </p>
      </div>
    </div>
  );
}
