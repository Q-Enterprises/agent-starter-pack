import { useState } from "react";
import { Plus, Users, Smile, Link as LinkIcon } from "lucide-react";
import { sampleAvatar } from "@/data";
import type { AvatarBlueprint } from "@/types";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AvatarBlueprints() {
  const [avatars, setAvatars] = useState<AvatarBlueprint[]>([sampleAvatar]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    archetype: string;
    artStyle: AvatarBlueprint['artStyle'];
  }>({ name: '', archetype: '', artStyle: 'pixel' });

  const handleCreate = () => {
    if (!form.name || !form.archetype) { toast.error("Name and archetype required"); return; }
    const avatar: AvatarBlueprint = {
      id: `av-${Date.now()}`,
      name: form.name,
      archetype: form.archetype,
      artStyle: form.artStyle,
      palette: ['#0ABAB5', '#1a1a2e', '#16213e', '#0f3460', '#e94560'],
      personality: [
        { trait: 'Analytical', value: Math.floor(Math.random() * 40) + 60 },
        { trait: 'Creative', value: Math.floor(Math.random() * 40) + 60 },
        { trait: 'Leadership', value: Math.floor(Math.random() * 40) + 60 },
      ],
      linkedCapsules: [],
      status: 'idle',
      createdAt: new Date().toISOString(),
    };
    setAvatars([avatar, ...avatars]);
    setOpen(false);
    toast.success(`Avatar "${avatar.name}" created`);
    setForm({ name: '', archetype: '', artStyle: 'pixel' });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Avatar Blueprints
          </h1>
          <p className="text-muted-foreground mt-2">
            Design avatar archetypes linked to token capsules
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(19,232,210,0.15)] hover:shadow-[0_0_20px_rgba(19,232,210,0.3)]"
        >
          <Plus className="w-5 h-5" /> New Avatar
        </button>
      </div>

      {open && (
        <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-xl p-6 space-y-6 animate-slide-up shadow-2xl">
          <h3 className="text-lg font-semibold text-primary">Create Avatar Blueprint</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Cyberpunk Architect"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Archetype</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Architect, Trickster"
                value={form.archetype}
                onChange={e => setForm(prev => ({ ...prev, archetype: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Art Style</label>
              <select
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                value={form.artStyle}
                onChange={e => setForm(prev => ({ ...prev, artStyle: e.target.value as AvatarBlueprint['artStyle'] }))}
              >
                <option value="pixel">Pixel Art</option>
                <option value="3d">3D Render</option>
                <option value="anime">Anime</option>
                <option value="realistic">Realistic</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99]"
          >
            Create Blueprint
          </button>
        </div>
      )}

      {/* Avatars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {avatars.map((av) => (
          <div key={av.id} className="group relative bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <StatusBadge status={av.status} />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-neon-purple/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary group-hover:scale-105 transition-all">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors">{av.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-primary/80">{av.archetype}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="capitalize">{av.artStyle}</span>
                  </div>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-3 bg-background/30 p-4 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  <Smile className="w-3 h-3 text-primary" /> Personality
                </div>
                {av.personality.map(p => (
                  <div key={p.trait} className="group/slider">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/80">{p.trait}</span>
                      <span className="font-mono text-primary">{p.value}%</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-neon-purple rounded-full transition-all duration-1000 group-hover/slider:brightness-110"
                        style={{ width: `${p.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Linked capsules */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3 text-primary" />
                  {av.linkedCapsules.length > 0 ? (
                    <span>{av.linkedCapsules.length} linked capsule(s)</span>
                  ) : (
                    <span>No linked capsules</span>
                  )}
                </div>

                {/* Palette */}
                <div className="flex gap-1">
                  {av.palette.slice(0, 3).map((c, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {av.palette.length > 3 && <div className="w-3 h-3 text-[8px] flex items-center justify-center text-muted-foreground">+</div>}
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
