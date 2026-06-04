/**
 * Verifiable harness check: ALL_TOOLS ids ↔ TOOL_PAGE_REGISTRY ↔ TOOL_GROUPS.
 * Run: npm run check:registry
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "src/lib/tools-config.ts");
const routesPath = join(root, "src/lib/tool-routes.tsx");

const configSrc = readFileSync(configPath, "utf8");
const routesSrc = readFileSync(routesPath, "utf8");

const toolIds = [...configSrc.matchAll(/^\s+id:\s+"([^"]+)"/gm)].map((m) => m[1]);
const registryIds = [
  ...routesSrc.matchAll(
    /^\s+(?:"([^"]+)"|([a-z][a-z0-9-]*)):\s*\{\s*Component/gm,
  ),
].map((m) => m[1] ?? m[2]);
const groupIds = [
  ...configSrc.matchAll(/tools:\s*\[([^\]]+)\]/g),
].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
const paths = [...configSrc.matchAll(/^\s+path:\s+"([^"]+)"/gm)].map((m) => m[1]);

const set = (arr) => new Set(arr);
const toolSet = set(toolIds);
const registrySet = set(registryIds);
const groupSet = set(groupIds);

let failed = false;
const err = (msg) => {
  console.error(`✗ ${msg}`);
  failed = true;
};
const ok = (msg) => console.log(`✓ ${msg}`);

const missingInRegistry = toolIds.filter((id) => !registrySet.has(id));
const orphanRegistry = registryIds.filter((id) => !toolSet.has(id));
const missingInTools = groupIds.filter((id) => !toolSet.has(id));
const notInAnyGroup = toolIds.filter((id) => !groupSet.has(id));
const dupPaths = paths.filter((p, i) => paths.indexOf(p) !== i);

if (missingInRegistry.length) err(`ALL_TOOLS missing in TOOL_PAGE_REGISTRY: ${missingInRegistry.join(", ")}`);
else ok("ALL_TOOLS ⊆ TOOL_PAGE_REGISTRY");

if (orphanRegistry.length) err(`Orphan TOOL_PAGE_REGISTRY keys: ${orphanRegistry.join(", ")}`);
else ok("TOOL_PAGE_REGISTRY ⊆ ALL_TOOLS");

if (missingInTools.length) err(`TOOL_GROUPS references unknown id: ${missingInTools.join(", ")}`);
else ok("TOOL_GROUPS ids exist in ALL_TOOLS");

if (notInAnyGroup.length) err(`ALL_TOOLS id not in any TOOL_GROUPS: ${notInAnyGroup.join(", ")}`);
else ok("Every tool id appears in TOOL_GROUPS");

if (dupPaths.length) err(`Duplicate path values: ${[...new Set(dupPaths)].join(", ")}`);
else ok("Tool paths are unique");

if (toolIds.length !== registryIds.length) {
  err(`Count mismatch: ALL_TOOLS=${toolIds.length}, registry=${registryIds.length}`);
}

process.exit(failed ? 1 : 0);
