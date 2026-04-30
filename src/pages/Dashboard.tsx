import { ALL_TOOLS, TOOL_GROUPS } from "@/src/lib/tools-config";
import { GroupBox } from "@/src/components/GroupBox";
import { ToolCard } from "@/src/components/ToolCard";
import { motion } from "motion/react";

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar Area (Recent/Pinned) */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <section className="bg-card/30 border border-border rounded-lg p-3 overflow-hidden">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> 
            Session Activity
          </h2>
          <div className="space-y-1">
            <div className="group p-2 rounded border border-transparent hover:border-border hover:bg-muted/20 cursor-default transition-all">
              <div className="text-[11px] font-bold text-foreground">Dev Environment Ready</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">Runtime: Browser • Mode: Production</div>
            </div>
            <div className="group p-2 rounded border border-transparent hover:border-border hover:bg-muted/20 cursor-default">
              <div className="text-[11px] font-bold text-foreground">Storage Available</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">Local Persistence: Active</div>
            </div>
            <div className="group p-2 rounded border border-transparent hover:border-border hover:bg-muted/20 cursor-default">
              <div className="text-[11px] font-bold text-foreground">Security Protocol</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">In-Browser Cipher: OK</div>
            </div>
          </div>
        </section>
        

      </aside>

      {/* Main Grid Area */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
        {TOOL_GROUPS.map((group, groupIdx) => {
          const groupTools = ALL_TOOLS.filter(t => group.tools.includes(t.id));
          
          return (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
            >
              <GroupBox title={group.title}>
                {groupTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </GroupBox>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
