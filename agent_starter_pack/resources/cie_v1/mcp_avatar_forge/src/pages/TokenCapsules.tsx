import { useState } from "react";
import { Key, Plus, Copy, Lock, Box, Brain, Palette, Zap } from "lucide-react";
import { sampleCapsules } from "@/data";
import type { TokenCapsule } from "@/types";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { name: "OpenAI", icon: Brain },
  { name: "Stability AI", icon: Palette },
  { name: "Replicate", icon: Zap },
];

export default function TokenCapsules() {
  const [capsules, setCapsules] = useState<TokenCapsule[]>(sampleCapsules);
  const [open, setOpen] = useState(false);
  const [newCapsule, setNewCapsule] = useState({ provider: '', label: '', tags: '', scopes: '', uploadSecret: false });

  const handleCreate = () => {
    if (!newCapsule.provider || !newCapsule.label) {
      toast.error("Provider and label are required");
      return;
    }
    const fingerprint = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const capsule: TokenCapsule = {
      id: `cap-${Date.now()}`,
      provider: newCapsule.provider,
      label: newCapsule.label,
      tags: newCapsule.tags.split(',').map(t => t.trim()).filter(Boolean),
      scopes: newCapsule.scopes.split(',').map(s => s.trim()).filter(Boolean),
      fingerprint,
      status: 'active',
      hasSecret: newCapsule.uploadSecret,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      allowedOrigins: ['*'],
    };
    setCapsules([capsule, ...capsules]);
    setOpen(false);
    setNewCapsule({ provider: '', label: '', tags: '', scopes: '', uploadSecret: false });
    toast.success(`Token capsule "${capsule.label}" created`, {
      description: `Fingerprint: ${fingerprint.slice(0, 16)}...`,
    });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Key className="w-8 h-8 text-primary" />
            Token Capsules
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage encrypted API credentials as non-reversible capsules
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(19,232,210,0.15)] hover:shadow-[0_0_20px_rgba(19,232,210,0.3)]"
        >
          <Plus className="w-5 h-5" /> New Capsule
        </button>
      </div>

      {open && (
        <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-xl p-6 space-y-6 animate-slide-up shadow-2xl">
          <h3 className="text-lg font-semibold text-primary">Create Token Capsule</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setNewCapsule(prev => ({ ...prev, provider: p.name }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:bg-accent/10",
                      newCapsule.provider === p.name
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <p.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Label</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., GPT-4 Production Key"
                value={newCapsule.label}
                onChange={e => setNewCapsule(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags (comma separated)</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="production, llm, public"
                value={newCapsule.tags}
                onChange={e => setNewCapsule(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Scopes (comma separated)</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="read, write, embedding"
                value={newCapsule.scopes}
                onChange={e => setNewCapsule(prev => ({ ...prev, scopes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
            <input
              type="checkbox"
              id="uploadSecret"
              className="w-5 h-5 rounded border-primary text-primary focus:ring-primary bg-background"
              checked={newCapsule.uploadSecret}
              onChange={e => setNewCapsule(prev => ({ ...prev, uploadSecret: e.target.checked }))}
            />
            <label htmlFor="uploadSecret" className="cursor-pointer select-none flex-1">
              <div className="font-medium text-foreground">Upload Secret</div>
              <div className="text-xs text-muted-foreground">Store encrypted secret server-side. Otherwise metadata + fingerprint only.</div>
            </label>
            <Lock className={cn("w-5 h-5 transition-colors", newCapsule.uploadSecret ? "text-primary" : "text-muted-foreground")} />
          </div>

          <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg flex gap-3 text-warning text-sm">
            <Box className="w-5 h-5 flex-shrink-0" />
            <p>Raw tokens are never stored in embeddings. Only SHA-256 fingerprints + metadata are indexed.</p>
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99]"
          >
            Create Capsule
          </button>
        </div>
      )}

      {/* Capsule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capsules.map((cap) => {
          const ProviderIcon = PROVIDERS.find(p => p.name === cap.provider)?.icon || Box;
          return (
            <div key={cap.id} className="group relative bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="absolute top-4 right-4">
                <StatusBadge status={cap.status} />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <ProviderIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{cap.label}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{cap.provider}</p>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="space-y-1 mb-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">SHA-256 Fingerprint</div>
                <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-white/5 font-mono text-xs text-primary/80 truncate">
                  <span className="truncate">{cap.fingerprint}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(cap.fingerprint); toast.success("Copied!"); }}
                    className="hover:text-white transition-colors p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {cap.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  {cap.hasSecret ? <Lock className="w-3 h-3 text-primary" /> : <Box className="w-3 h-3" />}
                  {cap.hasSecret ? 'Secret stored' : 'Metadata only'}
                </div>
                <div>{cap.scopes.length} scopes</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
