import { useState } from "react";
import { Cpu, Plus, Activity, Clock, RotateCw } from "lucide-react";
import { sampleLoraJobs, sampleDatasets } from "@/data";
import type { LoraJob } from "@/types";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export default function LoraJobs() {
  const [jobs, setJobs] = useState<LoraJob[]>(sampleLoraJobs);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    baseModel: 'SDXL 1.0',
    rank: '16',
    alpha: '8',
    steps: '1000',
    lr: '0.0001',
    datasetId: sampleDatasets[0]?.id || ''
  });

  const handleCreate = () => {
    if (!form.name) { toast.error("Job name required"); return; }
    const job: LoraJob = {
      id: `lora-${Date.now()}`,
      name: form.name,
      baseModel: form.baseModel,
      rank: parseInt(form.rank),
      alpha: parseInt(form.alpha),
      steps: parseInt(form.steps),
      lr: parseFloat(form.lr),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      datasetId: form.datasetId || 'ds-001',
    };
    setJobs([job, ...jobs]);
    setOpen(false);
    toast.success(`LoRA job "${job.name}" queued`);
    setForm({
      name: '',
      baseModel: 'SDXL 1.0',
      rank: '16',
      alpha: '8',
      steps: '1000',
      lr: '0.0001',
      datasetId: sampleDatasets[0]?.id || ''
    });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
            LoRA Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure and monitor LoRA training jobs
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(19,232,210,0.15)] hover:shadow-[0_0_20px_rgba(19,232,210,0.3)]"
        >
          <Plus className="w-5 h-5" /> New Job
        </button>
      </div>

      {open && (
        <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-xl p-6 space-y-6 animate-slide-up shadow-2xl">
          <h3 className="text-lg font-semibold text-primary">Create LoRA Job</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Name</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Neon Style v2"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Base Model</label>
              <select
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                value={form.baseModel}
                onChange={e => setForm(prev => ({ ...prev, baseModel: e.target.value }))}
              >
                <option value="SDXL 1.0">SDXL 1.0</option>
                <option value="SD 1.5">Stable Diffusion 1.5</option>
                <option value="Flux">Flux.1 Dev</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Rank</label>
                <input
                  type="number"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={form.rank}
                  onChange={e => setForm(prev => ({ ...prev, rank: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Alpha</label>
                <input
                  type="number"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={form.alpha}
                  onChange={e => setForm(prev => ({ ...prev, alpha: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Steps</label>
                <input
                  type="number"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={form.steps}
                  onChange={e => setForm(prev => ({ ...prev, steps: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Learning Rate</label>
                <input
                  type="text"
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={form.lr}
                  onChange={e => setForm(prev => ({ ...prev, lr: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Dataset</label>
              <select
                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                value={form.datasetId}
                onChange={e => setForm(prev => ({ ...prev, datasetId: e.target.value }))}
              >
                {sampleDatasets.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.imageCount} imgs)</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99]"
          >
            Queue Job
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="group relative bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              {job.status === 'running' && <span className="text-xs text-primary animate-pulse flex items-center gap-1"><RotateCw className="w-3 h-3 animate-spin" /> Training</span>}
              <StatusBadge status={job.status} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{job.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span className="bg-secondary px-1.5 py-0.5 rounded">{job.baseModel}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {(job.status === 'running' || job.status === 'succeeded') && (
                <div className="flex-1 max-w-md space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    <span>Progress</span>
                    <span className="text-primary">{job.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 relative overflow-hidden",
                        job.status === 'succeeded' ? "bg-success" : "bg-primary animate-pulse"
                      )}
                      style={{ width: `${job.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-slide-up" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/5">
              <div className="text-center">
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Rank</div>
                <div className="font-mono text-primary">{job.rank}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Alpha</div>
                <div className="font-mono text-primary">{job.alpha}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Steps</div>
                <div className="font-mono text-primary">{job.steps}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">LR</div>
                <div className="font-mono text-primary">{job.lr}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
