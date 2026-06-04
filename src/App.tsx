import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolLayout } from "@/src/components/ToolLayout";
import { Dashboard } from "@/src/pages/Dashboard";
import { ALL_TOOLS } from "@/src/lib/tools-config";
import { TOOL_PAGE_REGISTRY } from "@/src/lib/tool-routes";

function ToolRoutePage({ toolId }: { toolId: string }) {
  const tool = ALL_TOOLS.find((t) => t.id === toolId);
  const entry = TOOL_PAGE_REGISTRY[toolId];
  if (!tool || !entry) return null;

  const description = tool.routeDescription ?? tool.description;
  const content = <entry.Component />;

  return (
    <ToolLayout
      title={tool.title}
      description={description}
      fillViewport={tool.fillViewport}
    >
      {entry.lazy ? (
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">불러오는 중…</p>
          }
        >
          {content}
        </Suspense>
      ) : (
        content
      )}
    </ToolLayout>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ToolLayout title="Dashboard">
                <Dashboard />
              </ToolLayout>
            }
          />
          {ALL_TOOLS.map((tool) => (
            <Route
              path={tool.path}
              element={<ToolRoutePage toolId={tool.id} />}
            />
          ))}
        </Routes>
      </Router>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
