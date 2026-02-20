import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Key,
  Users,
  Database,
  Cpu,
  Server,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Token Capsules", icon: Key, path: "/capsules" },
  { label: "Avatar Blueprints", icon: Users, path: "/avatars" },
  { label: "Dataset Builder", icon: Database, path: "/datasets" },
  { label: "LoRA Jobs", icon: Cpu, path: "/lora-jobs" },
  { label: "MCP Settings", icon: Server, path: "/mcp-settings" },
  { label: "Audit Log", icon: FileText, path: "/audit-log" },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      <aside
        className={cn(
          "bg-card/50 backdrop-blur-md border-r border-border transition-all duration-300 flex flex-col z-20",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border relative">
          <div className={cn("absolute transition-all duration-300", collapsed ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
            <div className="w-8 h-8 rounded bg-primary animate-pulse-glow" />
          </div>
          <div className={cn("absolute transition-all duration-300 flex items-center gap-2", collapsed ? "opacity-0 scale-90" : "opacity-100 scale-100")}>
            <div className="w-6 h-6 rounded bg-primary shadow-[0_0_10px_rgba(19,232,210,0.5)]" />
            <div className="font-mono font-bold tracking-widest text-primary neon-glow leading-none">
              MCP Avatar
              <span className="block text-[10px] text-muted-foreground tracking-[0.3em]">FORGE v1.0</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(19,232,210,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_8px_rgba(19,232,210,0.8)]" />
                )}
                <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                {!collapsed && (
                  <span className="font-medium truncate animate-fade-in">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
