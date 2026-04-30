import { useState, useEffect } from "react";
import { ExternalLink, Plus, Trash2, Globe, ChevronDown, ChevronRight, Tag, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GroupBox } from "@/src/components/GroupBox";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "1", title: "MDN Web Docs", url: "https://developer.mozilla.org", category: "Documentation", description: "Web 기술 문서" },
  { id: "2", title: "Can I Use", url: "https://caniuse.com", category: "Documentation", description: "브라우저 호환성 체크" },
  { id: "3", title: "Tailwind CSS", url: "https://tailwindcss.com/docs", category: "Documentation" },
  { id: "4", title: "React Docs", url: "https://react.dev", category: "Documentation" },
  { id: "5", title: "Lucide Icons", url: "https://lucide.dev", category: "Assets", description: "아이콘 라이브러리" },
  { id: "6", title: "Unsplash", url: "https://unsplash.com", category: "Assets" },
  { id: "7", title: "Coolors", url: "https://coolors.co", category: "Design", description: "색상 팔레트 생성" },
  { id: "8", title: "Dribbble", url: "https://dribbble.com", category: "Design" },
  { id: "9", title: "Stack Overflow", url: "https://stackoverflow.com", category: "Community" },
  { id: "10", title: "GitHub", url: "https://github.com", category: "Community", description: "코드 호스팅 플랫폼" },
];

export function UrlBookmark() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem("vibe-tools:bookmarks");
    return saved ? (JSON.parse(saved) as Bookmark[]) : DEFAULT_BOOKMARKS;
  });

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const categories = Array.from(new Set<string>(bookmarks.map(b => b.category)));

  useEffect(() => {
    localStorage.setItem("vibe-tools:bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleExport = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("북마크가 내보내기되었습니다.");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string) as Bookmark[];
        if (!Array.isArray(importedData)) throw new Error("Invalid format");

        const validBookmarks = importedData.filter(b =>
          b.id && b.title && b.url && b.category
        );

        setBookmarks(prev => [...prev, ...validBookmarks]);
        toast.success(`${validBookmarks.length}개의 북마크를 가져왔습니다.`);
      } catch (err) {
        toast.error("유효하지 않은 JSON 파일입니다.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) {
      toast.error("제목과 URL은 필수입니다.");
      return;
    }

    const category = newCategory.trim() || selectedCategory;
    if (!category) {
      toast.error("카테고리를 선택하거나 입력하세요.");
      return;
    }

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      category,
    };

    setBookmarks(prev => [...prev, bookmark]);
    setTitle("");
    setUrl("");
    setDescription("");
    setSelectedCategory("");
    setNewCategory("");
    setShowForm(false);
    toast.success("북마크가 추가되었습니다.");
  };

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    toast.success("북마크가 삭제되었습니다.");
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleCategorySelect = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(cat);
      setNewCategory("");
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 버튼들 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1" />
          내보내기
        </Button>
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('bm-import')?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            가져오기
          </Button>
          <input
            id="bm-import"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? "취소" : "북마크 추가"}
        </Button>
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bm-title">제목 *</Label>
              <Input
                id="bm-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="사이트 제목"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bm-url">URL *</Label>
              <Input
                id="bm-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bm-desc">설명</Label>
            <Input
              id="bm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="간단한 설명 (선택사항)"
            />
          </div>

          <div className="space-y-2">
            <Label>카테고리</Label>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      selectedCategory === cat
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-muted/50 border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    {cat}
                  </button>
                ))}
              </div>
            )}
            <Input
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setSelectedCategory("");
              }}
              placeholder="새 카테고리 입력"
              className="text-sm"
            />
          </div>

          <Button onClick={handleAdd} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            추가하기
          </Button>
        </div>
      )}

      {/* 북마크 목록 */}
      {categories.map(cat => {
        const isCollapsed = collapsedCategories.has(cat);
        const categoryBookmarks = bookmarks.filter(b => b.category === cat);

        return (
          <div key={cat} className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleCategory(cat)}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-3 bg-primary/40 rounded-full" />
                  {cat}
                  <span className="text-[10px] font-normal text-muted-foreground/60 ml-1">
                    ({categoryBookmarks.length})
                  </span>
                </h3>
              </div>
              <div className="h-px flex-1 bg-border/40 ml-4" />
            </div>

            {!isCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categoryBookmarks.map(b => (
                  <div key={b.id} className="group relative">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="border border-border/50 hover:bg-accent transition-all duration-200">
                        <CardHeader className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                              <Globe className="h-3 w-3" />
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <CardTitle className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                                {b.title}
                              </CardTitle>
                              {b.description && (
                                <CardDescription className="text-[10px] text-muted-foreground line-clamp-1">
                                  {b.description}
                                </CardDescription>
                              )}
                              <CardDescription className="text-[9px] truncate text-muted-foreground/60">
                                {b.url}
                              </CardDescription>
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                        </CardHeader>
                      </Card>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(b.id);
                      }}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {bookmarks.length === 0 && (
        <p className="text-[10px] text-muted-foreground text-center py-8">
          북마크가 없습니다. 상단의 '북마크 추가' 버튼을 눌러 추가하세요.
        </p>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        개발 시 자주 사용하는 유용한 사이트들을 모아두었습니다.
      </p>
    </div>
  );
}
