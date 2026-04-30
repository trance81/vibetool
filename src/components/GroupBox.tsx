import { ReactNode } from "react";

interface GroupBoxProps {
  title: string;
  children: ReactNode;
  key?: string;
}

export function GroupBox({ title, children }: GroupBoxProps) {
  return (
    <section className="space-y-3 mb-6 last:mb-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
          <span className="w-1 h-3 bg-primary/40 rounded-full" />
          {title}
        </h3>
        <div className="h-px flex-1 bg-border/40 ml-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {children}
      </div>
    </section>
  );
}
