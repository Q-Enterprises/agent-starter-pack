import { Server, Shield, Globe, Terminal, Copy } from "lucide-react";
import { toast } from "sonner";

const mcpEndpoints = [
  { method: "POST", path: "/v1/avatars/generate", description: "Generate avatar from blueprint", auth: "Bearer" },
  { method: "GET", path: "/v1/capsules", description: "List active token capsules", auth: "Bearer" },
  { method: "POST", path: "/v1/lora/train", description: "Queue new LoRA training job", auth: "Bearer" },
  { method: "GET", path: "/v1/audit/logs", description: "Retrieve immutable audit trail", auth: "Bearer" },
];

export default function McpSettings() {
  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Server className="w-8 h-8 text-primary" />
          MCP Server API
        </h1>
        <p className="text-muted-foreground">
          Model Context Protocol endpoint documentation
        </p>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-muted/20">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Globe className="w-5 h-5" /> Base URL
          </h3>
          <div className="flex items-center gap-4 mt-4 bg-background/50 p-3 rounded-lg border border-border group">
            <code className="flex-1 font-mono text-primary/80">https://api.avatarforge.dev/mcp</code>
            <button
              onClick={() => { navigator.clipboard.writeText('https://api.avatarforge.dev/mcp'); toast.success("Copied!"); }}
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-white/5"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-warning/80 bg-warning/5 p-3 rounded border border-warning/10">
            <Shield className="w-4 h-4" />
            <p>All endpoints require Bearer token auth. Raw secrets are never returned — only ephemeral proxy references.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Terminal className="w-5 h-5" /> Endpoints
          </h3>
          <div className="space-y-4">
            {mcpEndpoints.map((ep) => (
              <div key={ep.path} className="group relative bg-background/30 border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">{ep.method}</span>
                      <span className="text-foreground/90">{ep.path}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-1">{ep.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground border border-white/5 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {ep.auth}
                    </span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(ep.path); toast.success("Copied!"); }}
                      className="text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-white/5"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
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
