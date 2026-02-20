import {
  Key,
  Users,
  Database,
  Cpu
} from "lucide-react";
import { sampleCapsules, sampleDatasets, sampleLoraJobs } from "@/data";

const stats = [
  {
    label: "Token Capsules",
    value: sampleCapsules.length,
    icon: Key,
    detail: `${sampleCapsules.filter(c => c.status === 'active').length} active`,
  },
  {
    label: "Avatars",
    value: 1,
    icon: Users,
    detail: "1 blueprint",
  },
  {
    label: "Datasets",
    value: sampleDatasets.length,
    detail: `${sampleDatasets.filter(d => d.status === 'ready').length} ready`,
    icon: Database,
  },
  {
    label: "LoRA Jobs",
    value: sampleLoraJobs.length,
    icon: Cpu,
    detail: `${sampleLoraJobs.filter(j => j.status === 'running').length} running`,
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md p-6 group hover:border-primary/50 transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{s.label}</h3>
            <s.icon className="w-5 h-5 text-primary group-hover:animate-pulse-glow" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold font-mono neon-glow">{s.value}</div>
            {s.detail && (
              <span className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20">
                {s.detail}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
