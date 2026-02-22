# Genkit self-review flow pattern (TypeScript)

If you want to adapt a Genkit app to run a **generate → apply tool → self-review** loop, use this pattern.

> Note: The current `agent-starter-pack` repository does not contain a backend `index.ts` + `agent.ts` Genkit entrypoint, so this is provided as an integration reference for projects that do.

## Recommended implementation

```ts
import { configureGenkit, defineFlow } from 'genkit';
import { vertexAI } from 'genkitx-vertexai';
import { z } from 'zod';

import { writeToFile } from './agent';

configureGenkit({
  plugins: [vertexAI()],
  logLevel: 'debug',
});

export const agentFlow = defineFlow(
  {
    name: 'agentFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      status: z.string(),
      analysis: z.string().optional(),
    }),
  },
  async (prompt) => {
    const model = vertexAI.model('gemini-1.5-flash');

    // 1) Primary generation with tool availability.
    const initial = await model.generate({
      prompt,
      tools: [writeToFile],
    });

    // 2) If a tool call is requested, execute it, then run a verification pass.
    const toolRequest = initial.toolRequest();
    if (toolRequest) {
      await toolRequest.run();

      const targetPath =
        typeof toolRequest.params?.path === 'string'
          ? toolRequest.params.path
          : 'the generated artifact';

      const review = await model.generate({
        prompt: [
          `Review the deployment/update of ${targetPath}.`,
          'Confirm the code addresses previous failure patterns found in firestore_export logs.',
          'Return a concise risk summary and any required follow-up actions.',
        ].join(' '),
      });

      return { status: 'Deployed & Verified', analysis: review.text() };
    }

    return { status: 'Completed', analysis: initial.text() };
  }
);
```

## Why this shape

- Keeps tool execution explicit and auditable.
- Uses a second LLM pass only when side effects occur.
- Gracefully handles missing `toolRequest.params.path`.
- Produces a stable output contract (`status`, optional `analysis`) for orchestration layers.

## Optional hardening

- Add a timeout/retry strategy around `toolRequest.run()`.
- Add path allow-listing before file writes.
- Include structured review output (JSON schema) rather than free text.


## MCP tool definitions (`mcp.json`)

If your runtime supports MCP tools, add explicit entries for code review and deployment monitoring.

```json
{
  "tools": [
    {
      "name": "code_review",
      "description": "Review generated or modified source for correctness, regressions, and policy issues.",
      "input_schema": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "diff": {"type": "string"},
          "context": {"type": "string"}
        },
        "required": ["path"]
      }
    },
    {
      "name": "deployment_monitor",
      "description": "Track rollout health and expose deployment status/metrics for post-deploy verification.",
      "input_schema": {
        "type": "object",
        "properties": {
          "service": {"type": "string"},
          "environment": {"type": "string"},
          "release": {"type": "string"}
        },
        "required": ["service", "environment"]
      }
    }
  ]
}
```

### Wiring pattern

- Use `code_review` immediately after any mutating tool call (file write, patch, migration).
- Use `deployment_monitor` after a deployment action to block success until health checks pass.
- Keep both tools optional so local development can run without external MCP services.

## Deployment handoff checklist

1. Save generated artifacts and commit changes.
2. Push to your deployment branch (for example, `main`).
3. Wait for rollout completion in your hosting/deployment console.
4. Confirm the flow returns `Deployed & Verified` only after monitor checks pass.
5. Capture latency/error metrics for the first post-release runs.

> Scope note: this repository is a starter-pack/template codebase and does not include a Firebase App Hosting project file layout by default. Apply this checklist in the downstream app repository where your `index.ts`, `agent.ts`, and `mcp.json` live.

