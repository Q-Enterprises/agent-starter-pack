import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  idle: "bg-primary/15 text-primary border-primary/30",
  walk: "bg-warning/15 text-warning border-warning/30",
  interact: "bg-neon-purple/15 text-neon-purple border-neon-purple/30",
  expired: "bg-muted text-muted-foreground border-border",
  revoked: "bg-destructive/15 text-destructive border-destructive/30",
  rotating: "bg-warning/15 text-warning border-warning/30 animate-pulse-glow",
  pending: "bg-muted text-muted-foreground border-border",
  running: "bg-primary/15 text-primary border-primary/30 animate-pulse-glow",
  succeeded: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  draft: "bg-muted text-muted-foreground border-border",
  processing: "bg-primary/15 text-primary border-primary/30 animate-pulse-glow",
  ready: "bg-success/15 text-success border-success/30",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider border", variants[status] || "bg-muted border-border")}>
      {status}
    </span>
  );
}
