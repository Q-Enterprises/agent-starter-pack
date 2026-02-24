# Unity MLOps Pipeline Setup Guide

This guide explains how to use `mlops_unity_pipeline.py` to automate Unity code generation, build, RL training, and model registration.

## Prerequisites

- Python 3.10+
- Unity Editor with command-line build support
- `mlagents` (for real training workflows)
- `croniter` for scheduler support
- Optional: Vertex AI project credentials

Install dependencies:

```bash
pip install mlagents==1.0.0 pyyaml croniter
```

## Core Components

- `UnityAssetSpec`: describes the asset/behavior to generate.
- `RLTrainingConfig`: controls RL and offline RL settings.
- `UnityMLOpsOrchestrator`: runs generate → build → train → register.
- `TrainingScheduler`: runs jobs from cron expressions.

## Quick Start

```python
import asyncio
from mlops_unity_pipeline import (
    UnityAssetSpec,
    RLTrainingConfig,
    TrainingJob,
    UnityMLOpsOrchestrator,
)

async def main():
    orchestrator = UnityMLOpsOrchestrator()

    asset = UnityAssetSpec(
        asset_id="test-001",
        name="SimpleAgent",
        asset_type="behavior",
        description="Reach target position",
    )

    config = RLTrainingConfig(algorithm="PPO", max_steps=100_000)

    job = TrainingJob(job_id="test-job", asset_spec=asset, rl_config=config)
    result = await orchestrator.execute_training_job(job)
    print(result)

asyncio.run(main())
```

## Scheduler (24/7)

```python
import asyncio
from mlops_unity_pipeline import (
    UnityAssetSpec,
    RLTrainingConfig,
    TrainingSchedule,
    TrainingScheduler,
    UnityMLOpsOrchestrator,
)

async def run_forever():
    orchestrator = UnityMLOpsOrchestrator()
    scheduler = TrainingScheduler(orchestrator)

    schedule = TrainingSchedule(
        schedule_id="nightly",
        cron_expression="0 2 * * *",
        asset_specs=[
            UnityAssetSpec(
                asset_id="nav-001",
                name="NavigationAgent",
                asset_type="behavior",
                description="Navigate around obstacles to a target",
            )
        ],
        rl_config=RLTrainingConfig(max_steps=500_000, num_envs=16),
    )

    scheduler.add_schedule(schedule)
    await scheduler.run_forever()

asyncio.run(run_forever())
```

## Offline RL Workflow

1. Record demonstrations in Unity.
2. Pass demonstration file paths via `RLTrainingConfig(demonstration_paths=[...])`.
3. Set `use_offline_rl=True`.
4. Use online fine-tuning as needed.

## Vertex AI Registration

Model registration is enabled when both environment variables are present:

- `VERTEX_PROJECT`
- `VERTEX_REGION`

Without these, the pipeline runs normally and skips registration.

## Production Notes

- Replace placeholder build/train methods with real subprocess calls to Unity and ML-Agents CLI.
- Emit structured logs for observability.
- Persist artifacts and metrics to your preferred data store.
- Use webhooks/queues for notifications.
