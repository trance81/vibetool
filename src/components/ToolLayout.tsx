import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function ToolLayout({ children, title, description }: ToolLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/30 sticky top-0 z-50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/" className="w-7 h-7 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity">
            V
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold tracking-tight text-foreground uppercase flex items-center">
              Vibe Tools <span className="text-primary font-mono text-[9px] ml-1.5 opacity-70">v.1.4.0</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-background/50 rounded px-2 py-0.5 border border-border">
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Runtime:</span>
            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div className="bg-primary w-[35%] h-full"></div>
            </div>
          </div>
          
          <nav className="flex items-center gap-1">
            {!isHome && (
              <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Link to="/">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Link to="/">
                <Home className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px] [background-position:center]">
        <div className="container py-4 px-4 max-w-5xl mx-auto">
          {!isHome && (
            <div className="mb-6 space-y-1 border-l-2 border-primary pl-4 py-1">
              <h1 className="text-xl font-bold tracking-tighter uppercase italic">{title}</h1>
              {description && (
                <p className="text-muted-foreground text-[11px] font-mono leading-tight">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      
      {/* Bottom Status Bar */}
      <footer className="h-6 border-t border-border flex items-center justify-between px-3 text-[9px] bg-background text-muted-foreground shrink-0 select-none font-mono uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
            System Online
          </span>
          <span className="border-l border-border h-2.5"></span>
          <span>Web-Crypto Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden xs:inline">UTF-8</span>
          <span className="text-primary font-bold">© {new Date().getFullYear()} Vibe Dev Tools</span>
        </div>
      </footer>
    </div>
  );
}
