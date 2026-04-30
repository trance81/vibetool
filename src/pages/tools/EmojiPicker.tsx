import { useState, useMemo, useEffect } from "react";
import data from "@emoji-mart/data";
import { Search, History, X, Smile, Hash, Box, Ruler, Plane, Utensils, Heart, Dog, Zap, Type, Grid } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmojiItem {
  id: string;
  char: string;
  name: string;
  category?: string;
}

// 업무용 특수문자 데이터
const SYMBOLS_DATA: Record<string, EmojiItem[]> = {
  "기본/문장": [
    { id: "s1", char: "※", name: "참고표" }, { id: "s2", char: "†", name: "칼표" }, { id: "s3", char: "‡", name: "겹칼표" }, { id: "s4", char: "§", name: "단락기호" },
    { id: "s5", char: "¶", name: "필크로우" }, { id: "s6", char: "•", name: "불릿" }, { id: "s7", char: "◦", name: "빈원불릿" }, { id: "s8", char: "‣", name: "세모불릿" },
    { id: "s9", char: "「", name: "낫표(열기)" }, { id: "s10", char: "」", name: "낫표(닫기)" }, { id: "s11", char: "『", name: "겹낫표(열기)" }, { id: "s12", char: "』", name: "겹낫표(닫기)" },
    { id: "s13", char: "〈", name: "홑화살(열기)" }, { id: "s14", char: "〉", name: "홑화살(닫기)" }, { id: "s15", char: "《", name: "겹화살(열기)" }, { id: "s16", char: "》", name: "겹화살(닫기)" },
    { id: "s17", char: "【", name: "대괄호(열기)" }, { id: "s18", char: "】", name: "대괄호(닫기)" }, { id: "s19", char: "〔", name: "거듭대자(열기)" }, { id: "s20", char: "〕", name: "거듭대자(닫기)" },
    { id: "s21", char: "№", name: "넘버" }, { id: "s22", char: "℡", name: "전화" }, { id: "s23", char: "™", name: "상표" }, { id: "s24", char: "©", name: "저작권" }, { id: "s25", char: "®", name: "등록상표" },
  ],
  "단위/수학": [
    { id: "u1", char: "㎜", name: "밀리미터" }, { id: "u2", char: "㎝", name: "센티미터" }, { id: "u3", char: "㎞", name: "킬로미터" }, { id: "u4", char: "㎡", name: "제곱미터" },
    { id: "u5", char: "㎥", name: "세제곱미터" }, { id: "u6", char: "㎤", name: "세제곱센티" }, { id: "u7", char: "ℓ", name: "리터" }, { id: "u8", char: "㎖", name: "밀리리터" },
    { id: "u9", char: "㏄", name: "시시" }, { id: "u10", char: "㎎", name: "밀리그램" }, { id: "u11", char: "㎏", name: "킬로그램" }, { id: "u12", char: "㏗", name: "산도" },
    { id: "u13", char: "℃", name: "섭씨" }, { id: "u14", char: "℉", name: "화씨" }, { id: "u15", char: "㏀", name: "킬로옴" }, { id: "u16", char: "㏁", name: "메가옴" },
    { id: "u17", char: "±", name: "플마" }, { id: "u18", char: "×", name: "곱하기" }, { id: "u19", char: "÷", name: "나누기" }, { id: "u20", char: "≠", name: "다름" },
    { id: "u21", char: "≤", name: "작거나등호" }, { id: "u22", char: "≥", name: "크거나등호" }, { id: "u23", char: "∞", name: "무한대" }, { id: "u24", char: "∑", name: "시그마" },
    { id: "u25", char: "√", name: "루트" }, { id: "u26", char: "π", name: "파이" }, { id: "u27", char: "∫", name: "적분" }, { id: "u28", char: "∬", name: "이중적분" },
  ],
  "원문자/숫자": [
    { id: "n1", char: "①", name: "원 1" }, { id: "n2", char: "②", name: "원 2" }, { id: "n3", char: "③", name: "원 3" }, { id: "n4", char: "④", name: "원 4" },
    { id: "n5", char: "⑤", name: "원 5" }, { id: "n6", char: "⑥", name: "원 6" }, { id: "n7", char: "⑦", name: "원 7" }, { id: "n8", char: "⑧", name: "원 8" },
    { id: "n9", char: "⑨", name: "원 9" }, { id: "n10", char: "⑩", name: "원 10" }, { id: "n11", char: "⑪", name: "원 11" }, { id: "n12", char: "⑫", name: "원 12" },
    { id: "n13", char: "⑬", name: "원 13" }, { id: "n14", char: "⑭", name: "원 14" }, { id: "n15", char: "⑮", name: "원 15" },
    { id: "n16", char: "⑴", name: "괄호 1" }, { id: "n17", char: "⑵", name: "괄호 2" }, { id: "n18", char: "⑶", name: "괄호 3" }, { id: "n19", char: "⑷", name: "괄호 4" }, { id: "n20", char: "⑸", name: "괄호 5" },
    { id: "n21", char: "Ⅰ", name: "로마 1" }, { id: "n22", char: "Ⅱ", name: "로마 2" }, { id: "n23", char: "Ⅲ", name: "로마 3" }, { id: "n24", char: "Ⅳ", name: "로마 4" }, { id: "n25", char: "Ⅴ", name: "로마 5" },
    { id: "n26", char: "Ⅵ", name: "로마 6" }, { id: "n27", char: "Ⅶ", name: "로마 7" }, { id: "n28", char: "Ⅷ", name: "로마 8" }, { id: "n29", char: "Ⅸ", name: "로마 9" }, { id: "n30", char: "Ⅹ", name: "로마 10" },
  ],
  "박스/표": [
    { id: "b1", char: "─", name: "가로선" }, { id: "b2", char: "│", name: "세로선" }, { id: "b3", char: "┌", name: "상좌코너" }, { id: "b4", char: "┐", name: "상우코너" },
    { id: "b5", char: "└", name: "하좌코너" }, { id: "b6", char: "┘", name: "하우코너" }, { id: "b7", char: "├", name: "좌측가지" }, { id: "b8", char: "┤", name: "우측가지" },
    { id: "b9", char: "┬", name: "상측가지" }, { id: "b10", char: "┴", name: "하측가지" }, { id: "b11", char: "┼", name: "교차점" }, { id: "b12", char: "━", name: "굵은가로" },
    { id: "b13", char: "┃", name: "굵은세로" }, { id: "b14", char: "┏", name: "굵은상좌" }, { id: "b15", char: "┓", name: "굵은상우" }, { id: "b16", char: "┗", name: "굵은하좌" },
    { id: "b17", char: "┛", name: "굵은하우" }, { id: "b18", char: "┣", name: "굵은좌측" }, { id: "b19", char: "┫", name: "굵은우측" }, { id: "b20", char: "┳", name: "굵은상측" },
    { id: "b21", char: "┻", name: "굵은하측" }, { id: "b22", char: "╋", name: "굵은교차" },
  ],
};

// Emoji Mart 데이터를 우리 형식으로 변환
const CATEGORY_MAP: Record<string, string> = {
  frequent: "최근 사용",
  people: "사람/표정",
  nature: "동물/자연",
  foods: "음식/음료",
  activity: "활동/스포츠",
  places: "여행/장소",
  objects: "물건/사물",
  symbols: "기호/문자",
  flags: "깃발"
};

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("최근 사용");
  const [recent, setRecent] = useState<EmojiItem[]>(() => {
    try {
      const saved = localStorage.getItem("vibe-tools:emoji:recent");
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  });

  // 이모지 마트 데이터를 우리 카테고리별로 매핑
  const allEmojiData = useMemo(() => {
    const result: Record<string, EmojiItem[]> = {};

    // 1. 최근 사용
    if (recent.length > 0) {
      result["최근 사용"] = recent;
    }

    // 2. 업무용 특수문자
    Object.entries(SYMBOLS_DATA).forEach(([cat, items]) => {
      result[cat] = items;
    });

    // 3. 표준 이모지
    const martData = data as any;
    martData.categories.forEach((cat: any) => {
      const catName = CATEGORY_MAP[cat.id] || cat.id;
      if (cat.id === "frequent") return; // 수동 관리

      const emojis: EmojiItem[] = cat.emojis.map((emojiId: string) => {
        const emoji = martData.emojis[emojiId];
        return {
          id: emojiId,
          char: emoji.skins[0].native,
          name: emoji.name,
          category: catName
        };
      });
      result[catName] = emojis;
    });

    return result;
  }, [recent]);

  // 이 탭이 비어있지 않은지 확인하여 초기 탭 설정 보정
  useEffect(() => {
    if (recent.length === 0 && activeTab === "최근 사용") {
      setActiveTab("기본/문장");
    }
  }, [recent.length]);

  // 실시간 검색 결과
  const filteredItems = useMemo(() => {
    if (!search.trim()) return null;
    const results: EmojiItem[] = [];
    const searchLower = search.toLowerCase();

    // 전체 카테고리 순회하며 검색
    Object.values(allEmojiData).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((item) => {
        if (!item) return;
        
        const charMatch = item.char && item.char.includes(search);
        const nameMatch = item.name && item.name.toLowerCase().includes(searchLower);
        const idMatch = item.id && item.id.toLowerCase().includes(searchLower);

        if (charMatch || nameMatch || idMatch) {
          if (!results.find((r) => r.char === item.char)) {
            results.push(item);
          }
        }
      });
    });
    return results;
  }, [search, allEmojiData]);

  const handleCopy = (item: EmojiItem) => {
    if (!item || !item.char) return;
    navigator.clipboard.writeText(item.char);
    toast.success(`'${item.char}' (${item.name || ""}) 복사됨`);
    
    // 최근 사용 업데이트
    const newRecent = [item, ...recent.filter(e => e.char !== item.char)].slice(0, 70);
    setRecent(newRecent);
    localStorage.setItem("vibe-tools:emoji:recent", JSON.stringify(newRecent));
  };

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        </div>
        <Input 
          placeholder="이모지 또는 기호 검색 (예: 웃음, 원, 체크, 화살표...)" 
          className="pl-10 h-14 bg-card border-muted hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-base rounded-2xl shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
            onClick={() => setSearch("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="border rounded-[24px] bg-card shadow-sm overflow-hidden flex flex-col h-[620px]">
        {search.trim() ? (
          // 검색 결과 화면
          <div className="flex-1 flex flex-col min-h-0 bg-secondary/5">
            <div className="p-5 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Search className="h-4 w-4" />
                <span className="text-sm tracking-tight">검색 결과 ({filteredItems?.length || 0})</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-5">
                {filteredItems && filteredItems.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
                    <TooltipProvider delayDuration={0}>
                      {filteredItems.map((item, i) => (
                        <EmojiCard key={i} item={item} onCopy={handleCopy} />
                      ))}
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/30">
                    <Search className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-base font-medium">검색 결과가 없습니다.</p>
                    <p className="text-sm">다른 키워드로 다시 검색해 보세요.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // 카테고리 탭 화면
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="bg-muted/10 border-b">
              <ScrollArea className="w-full">
                <TabsList className="h-14 w-max justify-start bg-transparent rounded-none px-4 space-x-2 flex flex-nowrap shrink-0 overflow-visible">
                  {recent.length > 0 && (
                    <TabsTrigger value="최근 사용" className="text-[11px] font-bold h-9 px-4 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl border border-transparent data-[state=active]:border-border/50 ring-0 hover:bg-muted/50 transition-all">
                      <History className="h-3.5 w-3.5 mr-2" /> 최근
                    </TabsTrigger>
                  )}
                  {Object.keys(allEmojiData).map(k => (
                    k !== "최근 사용" && (
                      <TabsTrigger 
                        key={k} 
                        value={k} 
                        className="text-[11px] font-bold h-9 px-4 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl border border-transparent data-[state=active]:border-border/50 ring-0 opacity-70 data-[state=active]:opacity-100 hover:bg-muted/50 transition-all whitespace-nowrap"
                      >
                        {getCategoryIcon(k)}
                        <span className="ml-2">{k}</span>
                      </TabsTrigger>
                    )
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1">
              <TooltipProvider delayDuration={0}>
                {Object.entries(allEmojiData).map(([category, items]) => (
                  <TabsContent key={category} value={category} className="p-6 mt-0 focus-visible:outline-none focus:ring-0">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="text-sm font-black text-foreground/80 uppercase tracking-widest">{category}</h3>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-muted/60 to-transparent" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
                       {items.map((item, i) => (
                        <EmojiCard key={`${category}-${i}`} item={item} onCopy={handleCopy} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </TooltipProvider>
            </ScrollArea>
          </Tabs>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between py-2">
        <div className="flex gap-2">
          <Badge variant="secondary" className="font-semibold px-3 py-1 text-[11px] rounded-full">
            💡 클릭하여 복사
          </Badge>
          <Badge variant="outline" className="font-medium px-3 py-1 text-[11px] rounded-full border-muted-foreground/20 text-muted-foreground">
            3,800+ 이모지 & 기술문자 수록
          </Badge>
        </div>
        <div className="flex items-center text-[11px] font-medium text-muted-foreground/60 gap-1.5 italic">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span>Real-time search provided by Unicode Standard</span>
        </div>
      </div>
    </div>
  );
}

function EmojiCard({ item, onCopy }: { item: EmojiItem; onCopy: (item: EmojiItem) => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="h-20 w-full p-0 flex flex-col items-center justify-center hover:bg-primary/5 hover:text-primary transition-all active:scale-95 border border-muted/20 hover:border-primary/30 rounded-2xl group relative shadow-sm hover:shadow-md bg-transparent cursor-pointer"
          onClick={() => onCopy(item)}
        >
          <span className="text-3xl mb-1 group-hover:scale-125 transition-transform duration-300 ease-out">{item.char}</span>
          <span className="text-[10px] text-muted-foreground truncate w-full px-2 text-center font-bold opacity-40 group-hover:opacity-100 uppercase tracking-tighter">
            {item.name}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="text-xs bg-slate-900 border-none text-white font-bold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in duration-150 z-50">
        {item.name}
      </TooltipContent>
    </Tooltip>
  );
}

function getCategoryIcon(name: string) {
  const size = "h-4 w-4";
  switch(name) {
    case "최근 사용": return <History className={size} />;
    case "기본/문장": return <Type className={size} />;
    case "단위/수학": return <Ruler className={size} />;
    case "박스/표": return <Box className={size} />;
    case "원문자/숫자": return <Hash className={size} />;
    case "사람/표정": return <Smile className={size} />;
    case "동물/자연": return <Dog className={size} />;
    case "음식/음료": return <Utensils className={size} />;
    case "여행/장소": return <Plane className={size} />;
    case "기호/문자": return <Grid className={size} />;
    case "활동/스포츠": return <Zap className={size} />;
    case "물건/사물": return <Box className={size} />;
    case "최고의 인기": return <Heart className={size} />;
    case "깃발": return <Plane className={size} />;
    default: return <Smile className={size} />;
  }
}
