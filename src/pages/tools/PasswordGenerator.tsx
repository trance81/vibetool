import { useState, useEffect } from "react";
import { Copy, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);

  const generatePasswords = () => {
    let charset = "";
    if (useUppercase) charset += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += excludeSimilar ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += excludeSimilar ? "23456789" : "0123456789";
    if (useSymbols) charset += "!@#$%^&*()-_=+[]{}";

    if (charset === "") {
      toast.error("최소 하나의 문자 옵션을 선택해야 합니다.");
      return;
    }

    const newPasswords: string[] = [];
    for (let i = 0; i < 5; i++) {
      let pwd = "";
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      for (let j = 0; j < length; j++) {
        pwd += charset[array[j] % charset.length];
      }
      newPasswords.push(pwd);
    }
    setPasswords(newPasswords);
  };

  useEffect(() => {
    generatePasswords();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("비밀번호가 복사되었습니다.");
  };

  const getStrength = () => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (useUppercase && useLowercase) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;
    
    if (score <= 2) return { label: "약함", color: "destructive", icon: ShieldAlert };
    if (score <= 4) return { label: "중간", color: "warning", icon: ShieldCheck };
    return { label: "강함", color: "success", icon: ShieldCheck };
  };

  const strength = getStrength();
  const StrengthIcon = strength.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>길이: {length}</Label>
            <Badge variant={strength.color as any} className="gap-1">
              <StrengthIcon className="h-3 w-3" /> {strength.label}
            </Badge>
          </div>
          <Slider
            value={[length]}
            onValueChange={(v) => setLength(v[0])}
            min={8}
            max={64}
            step={1}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="uppercase">대문자 (A-Z)</Label>
            <Switch id="uppercase" checked={useUppercase} onCheckedChange={setUseUppercase} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lowercase">소문자 (a-z)</Label>
            <Switch id="lowercase" checked={useLowercase} onCheckedChange={setUseLowercase} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="numbers">숫자 (0-9)</Label>
            <Switch id="numbers" checked={useNumbers} onCheckedChange={setUseNumbers} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="symbols">특수문자 (!@#$%^&*)</Label>
            <Switch id="symbols" checked={useSymbols} onCheckedChange={setUseSymbols} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="exclude" className="text-muted-foreground text-xs">유사 문자 제외 (il1Lo0O)</Label>
            <Switch id="exclude" checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
          </div>
        </div>

        <Button className="w-full" onClick={generatePasswords}>
          <RefreshCw className="h-4 w-4 mr-2" /> 새로 생성
        </Button>
      </div>

      <div className="space-y-4">
        <Label>생성된 비밀번호</Label>
        <div className="space-y-2">
          {passwords.map((pwd, idx) => (
            <Card key={idx} className="border-border/50 bg-muted/20">
              <CardContent className="p-3 py-2 flex items-center justify-between gap-4">
                <code className="text-sm font-mono break-all flex-1">{pwd}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(pwd)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center italic">
          Web Crypto API를 사용하여 브라우저에서 안전하게 생성됩니다.
        </p>
      </div>
    </div>
  );
}
