import * as React from "react";
import { useState, useCallback } from "react";
import { Upload, Download, Trash2, FileJson, ImageIcon, Archive } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  status: "idle" | "processing" | "done";
}

export function ImageResizer() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetWidth, setTargetWidth] = useState<number | "">("");
  const [targetHeight, setTargetHeight] = useState<number | "">("");
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/webp");
  const [method, setMethod] = useState<"scale" | "width" | "height">("width");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newImages: ImageFile[] = files.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      return { id, file, preview, width: 0, height: 0, status: "idle" };
    });
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const processImage = async (imgFile: ImageFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        if (method === "width" && targetWidth) {
          const ratio = (targetWidth as number) / w;
          w = targetWidth as number;
          h = h * ratio;
        } else if (method === "height" && targetHeight) {
          const ratio = (targetHeight as number) / h;
          h = targetHeight as number;
          w = w * ratio;
        } else if (method === "scale" && targetWidth && targetHeight) {
          w = targetWidth as number;
          h = targetHeight as number;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");
        
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Blob error");
        }, format, quality / 100);
      };
      img.onerror = reject;
      img.src = imgFile.preview;
    });
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    toast.info("이미지 처리 중...");

    try {
      for (const img of images) {
        const blob = await processImage(img);
        const ext = format.split("/")[1];
        const name = img.file.name.replace(/\.[^/.]+$/, "") + `_resized.${ext}`;
        zip.file(name, blob);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vibe_resized_images.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("전체 다운로드가 시작되었습니다.");
    } catch (e) {
      toast.error("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>크기 조정 방식</Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="width">가로 고정 (비율 유지)</SelectItem>
                  <SelectItem value="height">세로 고정 (비율 유지)</SelectItem>
                  <SelectItem value="scale">자유 조절 (비율 무시)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>가로(px)</Label>
                <Input 
                  type="number" 
                  value={targetWidth} 
                  onChange={(e) => setTargetWidth(e.target.value === "" ? "" : parseInt(e.target.value))}
                  disabled={method === "height"}
                />
              </div>
              <div className="space-y-2">
                <Label>세로(px)</Label>
                <Input 
                  type="number" 
                  value={targetHeight} 
                  onChange={(e) => setTargetHeight(e.target.value === "" ? "" : parseInt(e.target.value))}
                  disabled={method === "width"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>출력 포맷</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/webp">WebP (추천)</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <Label>품질 (Quality): {quality}%</Label>
              </div>
              <Slider value={[quality]} min={10} max={100} onValueChange={(v) => setQuality(v[0])} />
            </div>

            <Button className="w-full" disabled={images.length === 0} onClick={handleDownloadAll}>
              <Archive className="h-4 w-4 mr-2" /> 전체 ZIP 다운로드
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-border/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">이미지를 드래그하거나 클릭하여 추가</p>
            <p className="text-xs text-muted-foreground/60">PNG, JPG, WebP 지원</p>
          </div>
          <input type="file" className="hidden" multiple accept="image/*" onChange={onFileChange} />
        </label>

        <ScrollArea className="h-[500px] border rounded-lg p-4 bg-muted/10">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-10 mb-4" />
              <p className="text-sm italic">추가된 이미지가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative border rounded-lg bg-background overflow-hidden aspect-square shadow-sm">
                  <img src={img.preview} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-white font-mono truncate max-w-[80px]">{img.file.name}</span>
                    <Button variant="destructive" size="icon" className="h-6 w-6 rounded-sm" onClick={() => removeImage(img.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
