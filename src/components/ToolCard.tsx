import { Link } from "react-router-dom";
import { Tool } from "@/src/lib/tools-config";

/** Dashboard card: title 2-line slot, description 4-line slot (see AGENTS.md) */
const TITLE_SLOT_CLASS = "min-h-[2.5rem]"; /* 2 × leading-5 */
const DESC_SLOT_CLASS = "min-h-[4.5rem]"; /* 4 × leading-[1.125rem] */

interface ToolCardProps {
  tool: Tool;
  key?: string;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link to={tool.path} className="group block h-full">
      <div className="h-full min-h-33 bg-card border border-border p-3 rounded hover:bg-muted/50 transition-all cursor-pointer relative shadow-sm hover:shadow-primary/5 hover:border-primary/20">
        <div className="flex gap-2.5 items-start h-full">
          <div className="w-9 h-9 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col">
            <div
              className={`flex flex-col justify-center ${TITLE_SLOT_CLASS}`}
            >
              <h3 className="text-[13px] font-bold text-foreground leading-5 line-clamp-2 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
            </div>
            <div
              className={`mt-1 flex flex-col justify-center ${DESC_SLOT_CLASS}`}
            >
              <p className="text-[10px] text-muted-foreground leading-[1.125rem] line-clamp-4 w-full">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
      </div>
    </Link>
  );
}
