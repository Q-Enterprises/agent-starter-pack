import { useState } from "react";
import { Database, Plus, Image, FileText } from "lucide-react";
import { sampleDatasets } from "@/data";
import type { DatasetPlan } from "@/types";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";

export default function DatasetBuilder() {
  const [datasets, setDatasets] = useState<DatasetPlan[]>(sampleDatasets);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', classToken: '', caption: '', resolution: '1024', count: '50' });

  const handleCreate = () => {
    if (!form.name || !form.classToken) { toast.error("Name and class token required"); return; }
    const ds: DatasetPlan = {
      id: `ds-${Date.now()}`,
      name: form.name,
      classToken: form.classToken,
      captionTemplate: form.caption || `a photo of ${form.classToken}, {pose}, {background}`,
      resolution: parseInt(form.resolution),
      imageCount: parseInt(form.count),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    setDatasets([ds, ...datasets]);
    setOpen(false);
    toast.success(`Dataset "${ds.name}" created`);
    setForm({ name: '', classToken: '', caption: '', resolution: '1024', count: '50' });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Dataset Builder
          </h1>
          <p className="text-muted-foreground mt-2">
            Create dataset plans for LoRA training
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(19,232,210,0.15)] hover:shadow-[0_0_20px_rgba(19,232,210,0.3)]"
        >
          <Plus className="w-5 h-5" /> New Dataset
        </button>
      </div>

      {open && (
        <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-xl p-6 space-y-6 animate-slide-up shadow-2xl">
          <h3 className="text-lg font-semibold text-primary">Create Dataset Plan</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Dataset Name</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Cyberpunk Characters"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Class Token</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., cyb_char"
                value={form.classToken}
                onChange={e => setForm(prev => ({ ...prev, classToken: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Caption Template</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="a photo of [token], {pose}, {background}"
                value={form.caption}
                onChange={e => setForm(prev => ({ ...prev, caption: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Resolution</label>
                <select
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  value={form.resolution}
                  onChange={e => setForm(prev => ({ ...prev, resolution: e.target.value }))}
                >
                  <option value="512">512x512</option>
                  <option value="768">768x768</option>
                  <option value="1024">1024x1024</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Target Count</label>
                <input
                  type="number"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={form.count}
                  onChange={e => setForm(prev => ({ ...prev, count: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99]"
          >
            Create Plan
          </button>
        </div>
      )}

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((ds) => (
          <div key={ds.id} className="group relative bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1">
            <div className="absolute top-4 right-4 z-10">
              <StatusBadge status={ds.status} />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{ds.name}</h3>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="bg-secondary px-1.5 py-0.5 rounded">token: {ds.classToken}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-background/30 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  <FileText className="w-3 h-3 text-primary" /> Caption Template
                </div>
                <p className="text-xs font-mono text-primary/80 break-all">{ds.captionTemplate}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Image className="w-3 h-3 text-primary" />
                  <span>{ds.imageCount} images</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span>{ds.resolution}px</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
