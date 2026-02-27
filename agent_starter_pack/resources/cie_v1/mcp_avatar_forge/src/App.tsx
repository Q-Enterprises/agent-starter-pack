import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import TokenCapsules from "@/pages/TokenCapsules";
import AvatarBlueprints from "@/pages/AvatarBlueprints";
import DatasetBuilder from "@/pages/DatasetBuilder";
import LoraJobs from "@/pages/LoraJobs";
import McpSettings from "@/pages/McpSettings";
import AuditLog from "@/pages/AuditLog";
import PolicySimulator from "@/pages/PolicySimulator";
import ReceiptDebugger from "@/pages/ReceiptDebugger";
import Auth from "@/pages/Auth";
import { Toaster } from "sonner";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="flex bg-background text-foreground min-h-screen font-sans overflow-hidden">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="*"
            element={
              <Sidebar>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/capsules" element={<TokenCapsules />} />
                  <Route path="/simulator" element={<PolicySimulator />} />
                  <Route path="/avatars" element={<AvatarBlueprints />} />
                  <Route path="/datasets" element={<DatasetBuilder />} />
                  <Route path="/lora-jobs" element={<LoraJobs />} />
                  <Route path="/debugger" element={<ReceiptDebugger />} />
                  <Route path="/mcp-settings" element={<McpSettings />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                </Routes>
              </Sidebar>
            }
          />
        </Routes>
        <Toaster position="top-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
