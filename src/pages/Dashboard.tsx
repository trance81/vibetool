import { ALL_TOOLS, TOOL_GROUPS } from "@/src/lib/tools-config";
import { GroupBox } from "@/src/components/GroupBox";
import { ToolCard } from "@/src/components/ToolCard";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

export function Dashboard() {
  return (
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-4 lg:gap-5 xl:gap-6">
      {/* Sidebar — fixed; does not scroll with categories */}
      <aside className="shrink-0 w-full lg:w-56 xl:w-52 2xl:w-48 space-y-4">
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

        <section className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" />
            Data Privacy
          </h2>
          <div className="space-y-2">
            <p className="text-[10px] leading-relaxed text-muted-foreground font-bold">
              모든 데이터는 사용자 브라우저의 <span className="text-foreground underline decoration-primary/30">로컬 스토리지</span>에서만 처리됩니다.
            </p>
            <p className="text-[10px] leading-relaxed text-muted-foreground italic">
              * URL 단축 기능을 포함한 모든 도구는 어떠한 사용자 정보도 수집하거나 추적하지 않으며, 모든 프로세스는 개인정보 보호를 최우선으로 실행됩니다.
            </p>
          </div>
        </section>
      </aside>

      {/* Tool categories — only this region scrolls */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-y-contain space-y-5 xl:space-y-6 pr-0.5">
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
