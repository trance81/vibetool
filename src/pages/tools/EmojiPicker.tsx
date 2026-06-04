import { useState, useMemo, useEffect } from "react";
import data from "@emoji-mart/data";
import {
  Search,
  X,
  Smile,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ALL_SYMBOLS,
  SYMBOL_CATEGORIES,
  type SymbolItem,
} from "@/src/lib/unicode-symbols";

type PickerItem = SymbolItem & { category?: string };

const RECENT_KEY = "vibe-tools:emoji:recent";

const EMOJI_CATEGORY_MAP: Record<string, string> = {
  people: "사람/표정",
  nature: "동물/자연",
  foods: "음식/음료",
  activity: "활동/스포츠",
  places: "여행/장소",
  objects: "물건/사물",
  symbols: "기호",
  flags: "깃발",
};

type MartData = {
  categories: Array<{ id: string; emojis: string[] }>;
  emojis: Record<
    string,
    { id: string; name: string; skins: Array<{ native: string }> }
  >;
};

function buildEmojiCategories(): Record<string, PickerItem[]> {
  const mart = data as MartData;
  const result: Record<string, PickerItem[]> = {};

  for (const cat of mart.categories) {
    if (cat.id === "frequent") continue;
    const label = EMOJI_CATEGORY_MAP[cat.id] ?? cat.id;
    const items: PickerItem[] = [];

    for (const emojiId of cat.emojis) {
      const emoji = mart.emojis[emojiId];
      if (!emoji?.skins?.[0]?.native) continue;
      items.push({
        id: emojiId,
        char: emoji.skins[0].native,
        name: emoji.name,
        category: label,
      });
    }

    if (items.length > 0) result[label] = items;
  }

  return result;
}

const EMOJI_CATEGORIES = buildEmojiCategories();
const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

export function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [mainTab, setMainTab] = useState<"symbols" | "emoji">("symbols");
  const [activeCategory, setActiveCategory] = useState(SYMBOL_CATEGORIES[0].id);
  const [recent, setRecent] = useState<PickerItem[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const symbolSidebar = useMemo(() => {
    const items: Array<{ id: string; label: string }> = [];
    if (recent.length > 0) items.push({ id: "recent", label: "최근" });
    for (const cat of SYMBOL_CATEGORIES) {
      items.push({ id: cat.id, label: cat.label });
    }
    return items;
  }, [recent.length]);

  const emojiSidebar = useMemo(
    () =>
      Object.keys(EMOJI_CATEGORIES).map((label) => ({
        id: label,
        label,
      })),
    []
  );

  const sidebarItems = mainTab === "symbols" ? symbolSidebar : emojiSidebar;

  const symbolItemsByCategory = useMemo(() => {
    const map: Record<string, PickerItem[]> = {};
    for (const cat of SYMBOL_CATEGORIES) {
      map[cat.id] = cat.items;
    }
    if (recent.length > 0) {
      map.recent = recent;
    }
    return map;
  }, [recent]);

  useEffect(() => {
    const ids = sidebarItems.map((s) => s.id);
    if (!ids.includes(activeCategory)) {
      setActiveCategory(ids[0] ?? "");
    }
  }, [mainTab, sidebarItems, activeCategory]);

  useEffect(() => {
    if (mainTab === "emoji" && emojiSidebar.length > 0) {
      setActiveCategory(emojiSidebar[0].id);
    } else if (mainTab === "symbols") {
      setActiveCategory(symbolSidebar[0]?.id ?? SYMBOL_CATEGORIES[0].id);
    }
  }, [mainTab]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const pool = mainTab === "symbols" ? ALL_SYMBOLS : ALL_EMOJIS;
    const seen = new Set<string>();
    const results: PickerItem[] = [];

    for (const item of pool) {
      const match =
        item.char.includes(search.trim()) ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      if (match && !seen.has(item.char)) {
        seen.add(item.char);
        results.push(item);
      }
    }
    return results;
  }, [search, mainTab]);

  const activeItems = useMemo(() => {
    if (search.trim()) return filteredItems ?? [];
    if (mainTab === "symbols") {
      return symbolItemsByCategory[activeCategory] ?? [];
    }
    return EMOJI_CATEGORIES[activeCategory] ?? [];
  }, [search, mainTab, activeCategory, symbolItemsByCategory, filteredItems]);

  const handleCopy = (item: PickerItem) => {
    if (!item?.char) return;
    navigator.clipboard.writeText(item.char);
    toast.success(`'${item.char}' 복사됨`);

    const newRecent = [
      item,
      ...recent.filter((e) => e.char !== item.char),
    ].slice(0, 70);
    setRecent(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 gap-3">
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            mainTab === "symbols"
              ? "특수문자 검색 (예: 화살표, 체크, 원…)"
              : "이모지 검색 (예: smile, heart, flag…)"
          }
          className="pl-10 h-10 bg-card border-muted rounded-xl text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setSearch("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          setMainTab(v as "symbols" | "emoji");
          setSearch("");
        }}
        className="shrink-0"
      >
        <TabsList className="w-full h-9 grid grid-cols-2">
          <TabsTrigger value="symbols" className="text-xs font-bold gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            특수문자
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              {ALL_SYMBOLS.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="emoji" className="text-xs font-bold gap-1.5">
            <Smile className="h-3.5 w-3.5" />
            이모지
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              {ALL_EMOJIS.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-1 min-h-0 border border-border/60 rounded-2xl bg-card shadow-sm overflow-hidden">
        {!search.trim() && (
          <aside className="w-[7.5rem] sm:w-32 shrink-0 border-r border-border/60 bg-muted/10 flex flex-col min-h-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground px-2 py-2 shrink-0 border-b border-border/40">
              카테고리
            </p>
            <nav className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-0.5">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCategory(item.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left text-[10px] font-bold leading-tight transition-colors",
                    activeCategory === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <div className="shrink-0 px-3 py-2 border-b border-border/40 bg-muted/20 text-[10px] font-bold text-muted-foreground">
            {search.trim()
              ? `검색 결과 ${activeItems.length}개`
              : `${activeCategory} · ${activeItems.length}개`}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
            <TooltipProvider>
              {activeItems.length > 0 ? (
                <PickerGrid items={activeItems} onCopy={handleCopy} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-16">
                  {search.trim()
                    ? "검색 결과가 없습니다."
                    : "표시할 항목이 없습니다."}
                </p>
              )}
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-wrap gap-2 items-center text-[10px] text-muted-foreground">
        <Badge variant="secondary" className="text-[10px]">
          클릭하여 복사
        </Badge>
        <span>특수문자 Unicode · 이모지 Emoji Mart 데이터</span>
      </div>
    </div>
  );
}

function PickerGrid({
  items,
  onCopy,
}: {
  items: PickerItem[];
  onCopy: (item: PickerItem) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
      {items.map((item) => (
        <PickerCard
          key={`${item.id}-${item.char}`}
          item={item}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

function PickerCard({
  item,
  onCopy,
}: {
  item: PickerItem;
  onCopy: (item: PickerItem) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="h-14 w-full flex flex-col items-center justify-center gap-0.5 rounded-lg border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
          onClick={() => onCopy(item)}
        >
          <span className="text-2xl leading-none">{item.char}</span>
          <span className="text-[8px] text-muted-foreground line-clamp-1 w-full px-1 text-center">
            {item.name}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs max-w-[12rem]">
        {item.name}
      </TooltipContent>
    </Tooltip>
  );
}
