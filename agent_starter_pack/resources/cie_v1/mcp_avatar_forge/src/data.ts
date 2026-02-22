import type { AvatarBlueprint, DatasetPlan, LoraJob, TokenCapsule, AuditEvent } from "@/types";

export const sampleAvatar: AvatarBlueprint = {
  id: "av-101",
  name: "AE-101-LA",
  archetype: "Lead Architect",
  artStyle: "pixel",
  palette: ["#13e8d2", "#0b0e14", "#8a2be2", "#4b0082", "#ffffff"],
  personality: [
    { trait: "Analytical", value: 92 },
    { trait: "Creative", value: 78 },
    { trait: "Leadership", value: 85 },
  ],
  linkedCapsules: ["cap-001", "cap-002"],
  status: "ready",
  createdAt: new Date().toISOString(),
};

export const sampleCapsules: TokenCapsule[] = [
  {
    id: "cap-001",
    provider: "OpenAI",
    label: "GPT-4 Production",
    tags: ["llm", "prod"],
    scopes: ["completion", "embedding"],
    fingerprint: "a1b2c3d4e5f6...",
    status: "active",
    hasSecret: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: null,
    allowedOrigins: ["*"],
  },
  {
    id: "cap-002",
    provider: "Stability AI",
    label: "SDXL Turbo",
    tags: ["image", "fast"],
    scopes: ["generate"],
    fingerprint: "f6e5d4c3b2a1...",
    status: "active",
    hasSecret: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    expiresAt: null,
    allowedOrigins: ["*"],
  },
  {
    id: "cap-003",
    provider: "Replicate",
    label: "Llama 3 70B",
    tags: ["llm", "oss"],
    scopes: ["inference"],
    fingerprint: "1234567890abcdef...",
    status: "revoked",
    hasSecret: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    expiresAt: null,
    allowedOrigins: ["*"],
  },
];

export const sampleDatasets: DatasetPlan[] = [
  {
    id: "ds-001",
    name: "Cyberpunk Characters",
    classToken: "cyb_char",
    captionTemplate: "a cyberpunk character {pose} in neon city",
    resolution: 1024,
    imageCount: 50,
    status: "ready",
    createdAt: new Date().toISOString(),
  },
];

export const sampleLoraJobs: LoraJob[] = [
  {
    id: "lora-001",
    name: "Neon Style v1",
    baseModel: "SDXL 1.0",
    rank: 16,
    alpha: 8,
    steps: 1000,
    lr: 0.0001,
    status: "running",
    progress: 45,
    createdAt: new Date().toISOString(),
    datasetId: "ds-001",
  },
];

export const sampleAuditEvents: AuditEvent[] = [
  {
    id: "evt-001",
    action: "capsule.created",
    target: "GPT-4 Production",
    details: "Created new token capsule with fingerprint a1b2...",
    actor: "Admin",
    timestamp: new Date().toISOString(),
  },
  {
    id: "evt-002",
    action: "lora.started",
    target: "Neon Style v1",
    details: "Started LoRA training job on cluster-A",
    actor: "System",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];
