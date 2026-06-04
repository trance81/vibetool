export interface IconLibrary {
  id: string;
  name: string;
  iconifyPrefix: string;
  license: string;
  installCommand: string;
  usageHint: string;
  docsUrl: string;
}

export const ICON_LIBRARIES: IconLibrary[] = [
  {
    id: "lucide",
    name: "Lucide",
    iconifyPrefix: "lucide",
    license: "ISC",
    installCommand: "npm install lucide-react",
    usageHint: "import { Home } from \"lucide-react\";",
    docsUrl: "https://lucide.dev",
  },
  {
    id: "tabler",
    name: "Tabler Icons",
    iconifyPrefix: "tabler",
    license: "MIT",
    installCommand: "npm install @tabler/icons-react",
    usageHint: "import { IconHome } from \"@tabler/icons-react\";",
    docsUrl: "https://tabler.io/icons",
  },
  {
    id: "heroicons-outline",
    name: "Heroicons (Outline)",
    iconifyPrefix: "heroicons-outline",
    license: "MIT",
    installCommand: "npm install @heroicons/react",
    usageHint: "import { HomeIcon } from \"@heroicons/react/24/outline\";",
    docsUrl: "https://heroicons.com",
  },
  {
    id: "heroicons-solid",
    name: "Heroicons (Solid)",
    iconifyPrefix: "heroicons-solid",
    license: "MIT",
    installCommand: "npm install @heroicons/react",
    usageHint: "import { HomeIcon } from \"@heroicons/react/24/solid\";",
    docsUrl: "https://heroicons.com",
  },
  {
    id: "mdi",
    name: "Material Design Icons",
    iconifyPrefix: "mdi",
    license: "Apache-2.0",
    installCommand: "npm install @mdi/react @mdi/js",
    usageHint: "import Icon from \"@mdi/react\"; import { mdiHome } from \"@mdi/js\";",
    docsUrl: "https://pictogrammers.com/library/mdi/",
  },
  {
    id: "phosphor",
    name: "Phosphor Icons",
    iconifyPrefix: "ph",
    license: "MIT",
    installCommand: "npm install @phosphor-icons/react",
    usageHint: "import { House } from \"@phosphor-icons/react\";",
    docsUrl: "https://phosphoricons.com",
  },
  {
    id: "remix",
    name: "Remix Icon",
    iconifyPrefix: "ri",
    license: "Apache-2.0",
    installCommand: "npm install remixicon",
    usageHint: "import \"remixicon/fonts/remixicon.css\"; /* class: ri-home-line */",
    docsUrl: "https://remixicon.com",
  },
];

export function getIconLibrary(id: string): IconLibrary | undefined {
  return ICON_LIBRARIES.find((lib) => lib.id === id);
}

export function getIconLibraryByPrefix(
  prefix: string
): IconLibrary | undefined {
  return ICON_LIBRARIES.find((lib) => lib.iconifyPrefix === prefix);
}

export interface IconSearchHit {
  prefix: string;
  name: string;
  libraryId: string;
  libraryName: string;
}

const SUPPORTED_PREFIXES = new Set(
  ICON_LIBRARIES.map((lib) => lib.iconifyPrefix)
);

export function parseIconifyRef(
  item: string | { name?: string; prefix?: string }
): { prefix: string; name: string } | null {
  if (typeof item === "string") {
    const colon = item.indexOf(":");
    if (colon === -1) return null;
    return {
      prefix: item.slice(0, colon),
      name: item.slice(colon + 1),
    };
  }
  if (item.prefix && item.name) {
    return { prefix: item.prefix, name: item.name };
  }
  return null;
}

function hitFromRef(ref: { prefix: string; name: string }): IconSearchHit | null {
  if (!SUPPORTED_PREFIXES.has(ref.prefix)) return null;
  const lib = getIconLibraryByPrefix(ref.prefix);
  if (!lib) return null;
  return {
    prefix: ref.prefix,
    name: ref.name,
    libraryId: lib.id,
    libraryName: lib.name,
  };
}

async function fetchGlobalIconifySearch(
  query: string,
  limit: number
): Promise<IconSearchHit[]> {
  const res = await fetch(
    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) throw new Error("전체 검색에 실패했습니다.");

  const data = await res.json();
  const hits: IconSearchHit[] = [];

  for (const item of data.icons ?? []) {
    const ref = parseIconifyRef(item);
    if (!ref) continue;
    const hit = hitFromRef(ref);
    if (hit) hits.push(hit);
  }

  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.prefix}:${hit.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 앱에 등록된 모든 라이브러리에서 검색 */
export async function searchAllIconLibraries(
  query: string,
  limitPerLibrary = 120
): Promise<IconSearchHit[]> {
  try {
    const global = await fetchGlobalIconifySearch(query, 999);
    if (global.length > 0) return global;
  } catch {
    /* fallback to per-library search */
  }

  const batches = await Promise.all(
    ICON_LIBRARIES.map(async (lib) => {
      try {
        const names = await searchIconNames(
          lib.iconifyPrefix,
          query,
          limitPerLibrary
        );
        return names.map(
          (name): IconSearchHit => ({
            prefix: lib.iconifyPrefix,
            name,
            libraryId: lib.id,
            libraryName: lib.name,
          })
        );
      } catch {
        return [];
      }
    })
  );

  const seen = new Set<string>();
  return batches.flat().filter((hit) => {
    const key = `${hit.prefix}:${hit.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchIconNames(prefix: string): Promise<string[]> {
  const res = await fetch(
    `https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}`
  );
  if (!res.ok) throw new Error("아이콘 목록을 불러오지 못했습니다.");

  const data = await res.json();
  const fromCategories: string[] = data.categories
    ? (Object.values(data.categories) as string[][]).flat()
    : [];
  const names = [...(data.uncategorized ?? []), ...fromCategories];

  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export async function searchIconNames(
  prefix: string,
  query: string,
  limit = 999
): Promise<string[]> {
  const res = await fetch(
    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${encodeURIComponent(prefix)}&limit=${limit}`
  );
  if (!res.ok) throw new Error("아이콘 검색에 실패했습니다.");

  const data = await res.json();
  const names = (data.icons ?? [])
    .map((item: string | { name?: string; prefix?: string }) => {
      const ref = parseIconifyRef(item);
      if (!ref || ref.prefix !== prefix) return null;
      return ref.name;
    })
    .filter((name: string | null): name is string => Boolean(name));

  return [...new Set(names)];
}
