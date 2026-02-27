import type { AvatarBlueprint } from "@/types";
import { CircuitBoard } from "lucide-react";

export default function HeroAvatar({ avatar }: { avatar: AvatarBlueprint }) {
  return (
    <div className="relative group overflow-hidden rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(19,232,210,0.2)]">
      {/* Hero Image */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <CircuitBoard className="w-24 h-24 text-primary animate-pulse-slow" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-32 h-32 rounded-full border-2 border-primary/30 p-1 group-hover:border-primary group-hover:scale-105 transition-all">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-neon-purple/20 flex items-center justify-center overflow-hidden">
            <span className="text-4xl">🤖</span>
          </div>
          <div className="absolute inset-0 rounded-full animate-spin-slow border-t-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="text-center md:text-left space-y-2">
          <h2 className="text-2xl font-bold font-mono tracking-tight neon-glow text-white">
            {avatar.name}
          </h2>
          <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {avatar.archetype}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="capitalize">{avatar.status}</span>
          </div>
        </div>
      </div>

      {/* Personality Sliders */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Personality Matrix
        </h3>
        {avatar.personality.map((p) => (
          <div key={p.trait} className="group/slider">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground/80 group-hover/slider:text-primary transition-colors">{p.trait}</span>
              <span className="font-mono text-primary">{p.value}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-neon-purple rounded-full transition-all duration-1000 group-hover/slider:brightness-110"
                style={{ width: `${p.value}%` }}
              />
            </div>
          </div>
        ))}

        {/* Palette */}
        <div className="pt-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Color Palette
          </h3>
          <div className="flex gap-2">
            {avatar.palette.map((c, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded border border-white/10 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
