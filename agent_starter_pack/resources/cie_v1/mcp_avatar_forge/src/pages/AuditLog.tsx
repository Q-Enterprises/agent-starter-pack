import { useState } from "react";
import { FileText, Search, Clock, ShieldAlert, Activity } from "lucide-react";
import { sampleAuditEvents } from "@/data";
import { cn } from "@/lib/utils";

const eventColors: Record<string, string> = {
  'capsule.created': 'bg-primary/15 text-primary border-primary/30',
  'capsule.rotate': 'bg-warning/15 text-warning border-warning/30',
  'avatar.created': 'bg-neon-purple/15 text-neon-purple border-neon-purple/30',
  'dataset.ready': 'bg-success/15 text-success border-success/30',
  'lora.succeeded': 'bg-success/15 text-success border-success/30',
  'lora.started': 'bg-primary/15 text-primary border-primary/30',
};

export default function AuditLog() {
  const [filter, setFilter] = useState('');
  const filtered = sampleAuditEvents.filter(e =>
    !filter ||
    e.action.toLowerCase().includes(filter.toLowerCase()) ||
    e.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-2">
            Immutable append-only event log
          </p>
        </div>

        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="w-full md:w-64 bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
            placeholder="Search events..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-white/5 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Target</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium text-right">Actor / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="p-4 font-mono">
                    <span className={cn("px-2 py-1 rounded border text-xs font-semibold", eventColors[evt.action] || "bg-muted text-muted-foreground border-white/10")}>
                      {evt.action}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-foreground group-hover:text-primary transition-colors">{evt.target}</td>
                  <td className="p-4 text-muted-foreground max-w-md truncate" title={evt.details}>{evt.details}</td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 text-primary" /> {evt.actor}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
              <p>No events found matching your filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
