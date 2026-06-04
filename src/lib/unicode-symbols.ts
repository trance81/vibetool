export interface SymbolItem {
  id: string;
  char: string;
  name: string;
}

export interface SymbolCategory {
  id: string;
  label: string;
  items: SymbolItem[];
}

function codePointLabel(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

function isSymbolChar(char: string): boolean {
  if (/\p{C}/u.test(char)) return false;
  if (!/\p{Assigned}/u.test(char)) return false;
  if (/\p{Extended_Pictographic}/u.test(char)) return false;
  return true;
}

function fromRange(
  categoryId: string,
  start: number,
  end: number,
  nameFor?: (cp: number, char: string) => string
): SymbolItem[] {
  const items: SymbolItem[] = [];
  const seen = new Set<string>();

  for (let cp = start; cp <= end; cp++) {
    const char = String.fromCodePoint(cp);
    if (!isSymbolChar(char) || seen.has(char)) continue;
    seen.add(char);
    items.push({
      id: `${categoryId}-${cp}`,
      char,
      name: nameFor?.(cp, char) ?? codePointLabel(cp),
    });
  }
  return items;
}

function fromNamed(
  categoryId: string,
  entries: Array<{ char: string; name: string }>
): SymbolItem[] {
  return entries.map((e, i) => ({
    id: `${categoryId}-n${i}`,
    char: e.char,
    name: e.name,
  }));
}

const NAMED_BASIC = fromNamed("basic", [
  { char: "※", name: "참고표" },
  { char: "†", name: "칼표" },
  { char: "‡", name: "겹칼표" },
  { char: "§", name: "단락" },
  { char: "¶", name: "필크로우" },
  { char: "•", name: "불릿" },
  { char: "◦", name: "빈불릿" },
  { char: "‣", name: "삼각불릿" },
  { char: "「", name: "낫표 열기" },
  { char: "」", name: "낫표 닫기" },
  { char: "『", name: "겹낫표 열기" },
  { char: "』", name: "겹낫표 닫기" },
  { char: "〈", name: "홑꺾쇠 열기" },
  { char: "〉", name: "홑꺾쇠 닫기" },
  { char: "《", name: "겹꺾쇠 열기" },
  { char: "》", name: "겹꺾쇠 닫기" },
  { char: "【", name: "대괄호 열기" },
  { char: "】", name: "대괄호 닫기" },
  { char: "〔", name: "거듭괄호 열기" },
  { char: "〕", name: "거듭괄호 닫기" },
  { char: "№", name: "넘버" },
  { char: "℡", name: "전화" },
  { char: "™", name: "상표" },
  { char: "©", name: "저작권" },
  { char: "®", name: "등록상표" },
  { char: "…", name: "말줄임" },
  { char: "–", name: "엔대시" },
  { char: "—", name: "엠대시" },
  { char: "‚", name: "아래9 쉼표" },
  { char: "„", name: "아래9 따옴표" },
  { char: "‹", name: "단일 꺾쇠 열기" },
  { char: "›", name: "단일 꺾쇠 닫기" },
  { char: "«", name: "겹꺾쇠 열기" },
  { char: "»", name: "겹꺾쇠 닫기" },
]);

const NAMED_UNITS = fromNamed("units", [
  { char: "㎜", name: "밀리미터" },
  { char: "㎝", name: "센티미터" },
  { char: "㎞", name: "킬로미터" },
  { char: "㎡", name: "제곱미터" },
  { char: "㎥", name: "세제곱미터" },
  { char: "㎤", name: "세제곱센티" },
  { char: "ℓ", name: "리터" },
  { char: "㎖", name: "밀리리터" },
  { char: "㎎", name: "밀리그램" },
  { char: "㎏", name: "킬로그램" },
  { char: "℃", name: "섭씨" },
  { char: "℉", name: "화씨" },
  { char: "±", name: "플러스마이너스" },
  { char: "×", name: "곱하기" },
  { char: "÷", name: "나누기" },
  { char: "≠", name: "같지않음" },
  { char: "≤", name: "작거나같음" },
  { char: "≥", name: "크거나같음" },
  { char: "∞", name: "무한대" },
  { char: "∑", name: "시그마" },
  { char: "√", name: "제곱근" },
  { char: "π", name: "파이" },
  { char: "∫", name: "적분" },
  { char: "∬", name: "이중적분" },
  { char: "∂", name: "편미분" },
  { char: "∇", name: "나블라" },
  { char: "≈", name: "근사" },
  { char: "≡", name: "동치" },
  { char: "∝", name: "비례" },
  { char: "°", name: "도" },
  { char: "′", name: "프라임" },
  { char: "″", name: "이중프라임" },
]);

const NAMED_NUMBERS = fromNamed("numbers", [
  { char: "①", name: "원 1" },
  { char: "②", name: "원 2" },
  { char: "③", name: "원 3" },
  { char: "④", name: "원 4" },
  { char: "⑤", name: "원 5" },
  { char: "⑥", name: "원 6" },
  { char: "⑦", name: "원 7" },
  { char: "⑧", name: "원 8" },
  { char: "⑨", name: "원 9" },
  { char: "⑩", name: "원 10" },
  { char: "⑪", name: "원 11" },
  { char: "⑫", name: "원 12" },
  { char: "⑬", name: "원 13" },
  { char: "⑭", name: "원 14" },
  { char: "⑮", name: "원 15" },
  { char: "⑴", name: "괄호 1" },
  { char: "⑵", name: "괄호 2" },
  { char: "⑶", name: "괄호 3" },
  { char: "⑷", name: "괄호 4" },
  { char: "⑸", name: "괄호 5" },
  { char: "Ⅰ", name: "로마 1" },
  { char: "Ⅱ", name: "로마 2" },
  { char: "Ⅲ", name: "로마 3" },
  { char: "Ⅳ", name: "로마 4" },
  { char: "Ⅴ", name: "로마 5" },
  { char: "Ⅵ", name: "로마 6" },
  { char: "Ⅶ", name: "로마 7" },
  { char: "Ⅷ", name: "로마 8" },
  { char: "Ⅸ", name: "로마 9" },
  { char: "Ⅹ", name: "로마 10" },
]);

const NAMED_MARKS = fromNamed("marks", [
  { char: "✓", name: "체크" },
  { char: "✔", name: "굵은체크" },
  { char: "✕", name: "엑스" },
  { char: "✖", name: "굵은엑스" },
  { char: "✗", name: "체크엑스" },
  { char: "✘", name: "굵은체크엑스" },
  { char: "☐", name: "빈체크박스" },
  { char: "☑", name: "체크박스" },
  { char: "☒", name: "엑스박스" },
  { char: "★", name: "별" },
  { char: "☆", name: "빈별" },
  { char: "♠", name: "스페이드" },
  { char: "♣", name: "클럽" },
  { char: "♥", name: "하트" },
  { char: "♦", name: "다이아" },
  { char: "→", name: "오른쪽화살표" },
  { char: "←", name: "왼쪽화살표" },
  { char: "↑", name: "위화살표" },
  { char: "↓", name: "아래화살표" },
  { char: "↔", name: "양방향" },
  { char: "↕", name: "상하" },
  { char: "⇒", name: "이중오른쪽" },
  { char: "⇐", name: "이중왼쪽" },
  { char: "⇔", name: "이중양방향" },
]);

function dedupe(items: SymbolItem[]): SymbolItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.char)) return false;
    seen.add(item.char);
    return true;
  });
}

/** Unicode 블록 + 업무용 기호 (emoji-mart와 별도) */
export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  { id: "basic", label: "기본/문장", items: NAMED_BASIC },
  { id: "units", label: "단위/수학", items: NAMED_UNITS },
  { id: "numbers", label: "원문자/숫자", items: NAMED_NUMBERS },
  { id: "marks", label: "체크/표시", items: NAMED_MARKS },
  {
    id: "box",
    label: "박스/표",
    items: dedupe([
      ...fromNamed("box", [
        { char: "─", name: "가로선" },
        { char: "│", name: "세로선" },
        { char: "┌", name: "상좌" },
        { char: "┐", name: "상우" },
        { char: "└", name: "하좌" },
        { char: "┘", name: "하우" },
        { char: "├", name: "좌가지" },
        { char: "┤", name: "우가지" },
        { char: "┬", name: "상가지" },
        { char: "┴", name: "하가지" },
        { char: "┼", name: "교차" },
      ]),
      ...fromRange("box", 0x2500, 0x257f),
    ]),
  },
  {
    id: "arrows",
    label: "화살표",
    items: dedupe([
      ...fromRange("arrows", 0x2190, 0x21ff),
      ...fromRange("arrows", 0x27a0, 0x27bf),
    ]),
  },
  {
    id: "shapes",
    label: "도형",
    items: dedupe([
      ...fromRange("shapes", 0x25a0, 0x25ff),
      ...fromRange("shapes", 0x2580, 0x259f),
    ]),
  },
  {
    id: "currency",
    label: "화폐",
    items: fromRange("currency", 0x20a0, 0x20cf),
  },
  {
    id: "math",
    label: "연산/논리",
    items: fromRange("math", 0x2200, 0x22ff),
  },
  {
    id: "tech",
    label: "기술/단위기호",
    items: fromRange("tech", 0x2300, 0x23ff),
  },
  {
    id: "misc",
    label: "기타기호",
    items: dedupe([
      ...fromRange("misc", 0x2600, 0x26ff),
      ...fromRange("misc", 0x2700, 0x27bf),
    ]),
  },
];

export const ALL_SYMBOLS: SymbolItem[] = dedupe(
  SYMBOL_CATEGORIES.flatMap((c) => c.items)
);
