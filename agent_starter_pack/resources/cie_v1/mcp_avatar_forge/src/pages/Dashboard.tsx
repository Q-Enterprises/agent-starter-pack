import HeroAvatar from "@/components/dashboard/HeroAvatar";
import StatsCards from "@/components/dashboard/StatsCards";
import { sampleAuditEvents, sampleAvatar } from "@/data";
import { Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white neon-glow">
          MCP Avatar Forge
        </h1>
        <p className="text-muted-foreground">
          Manage token capsules, generate avatars, and train LoRA models
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero Preview */}
        <div className="lg:col-span-2">
          <HeroAvatar avatar={sampleAvatar} />
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md p-6">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold uppercase tracking-wider">Recent Activity</h3>
          </div>

          <div className="space-y-6">
            {sampleAuditEvents.slice(0, 5).map((evt) => (
              <div key={evt.id} className="relative pl-6 border-l border-primary/20 pb-1 last:pb-0">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-[0_0_5px_rgba(19,232,210,0.8)]" />

                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{evt.details}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-mono text-primary/70 bg-primary/5 px-1.5 rounded">{evt.action}</span>
                    <span>
                      {new Date(evt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
