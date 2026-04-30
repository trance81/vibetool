import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tool } from "@/src/lib/tools-config";

interface ToolCardProps {
  tool: Tool;
  key?: string;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link to={tool.path} className="group">
      <div className="h-full bg-card border border-border p-3 rounded hover:bg-muted/50 transition-all cursor-pointer relative group/inner shadow-sm hover:shadow-primary/5">
        <div className="flex flex-col gap-2">
          <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
              {tool.title}
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity font-mono">
              {tool.description}
            </div>
          </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute bottom-1 right-1 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="w-6 h-6 rotate-12 blur-[0.5px]" />
        </div>
        
        {/* Hover accent bar */}
        <div className="absolute top-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
      </div>
    </Link>
  );
}
