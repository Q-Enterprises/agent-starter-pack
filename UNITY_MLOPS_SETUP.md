# Unity MLOps Setup Guide

This guide shows how to run the autonomous Unity + ML-Agents training pipeline in `mlops_unity_pipeline.py`.

## What the pipeline does

1. Generates Unity C# behavior scripts from a natural-language asset specification.
2. Builds Unity environments in batch/headless mode.
3. Trains reinforcement learning agents (offline/online) with ML-Agents.
4. Registers resulting model metadata for deployment workflows.
5. Runs recurring jobs with cron-style schedules.

## Prerequisites

- Unity Editor installed and available as `Unity` on your shell path.
- Python 3.10+.
- ML-Agents tooling:

```bash
pip install mlagents==1.0.0 pyyaml croniter
```

## Quick start

Create a `test.py`:

```python
import asyncio
from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingJob,
    UnityAssetSpec,
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

    config = RLTrainingConfig(
        algorithm="PPO",
        max_steps=100_000,
    )

    job = TrainingJob(
        job_id="test-job",
        asset_spec=asset,
        rl_config=config,
    )

    result = await orchestrator.execute_training_job(job)
    print(result)


asyncio.run(main())
```

Run it:

```bash
python test.py
``` 

## Scheduling 24/7 training

Create a `scheduler.py`:

```python
import asyncio
from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingSchedule,
    TrainingScheduler,
    UnityAssetSpec,
    UnityMLOpsOrchestrator,
)


async def run_forever():
    orchestrator = UnityMLOpsOrchestrator()
    scheduler = TrainingScheduler(orchestrator)

    asset = UnityAssetSpec(
        asset_id="nav-001",
        name="NavigationAgent",
        asset_type="behavior",
        description="Navigate around obstacles to a goal",
    )

    schedule = TrainingSchedule(
        schedule_id="nightly-nav-agent",
        cron_expression="0 2 * * *",
        asset_specs=[asset],
        rl_config=RLTrainingConfig(algorithm="PPO", max_steps=1_000_000),
    )

    scheduler.add_schedule(schedule)
    await scheduler.run_forever()


asyncio.run(run_forever())
```

## Offline RL workflow

1. Collect demonstrations in Unity and export data.
2. Set `offline_dataset_path` in `RLTrainingConfig`.
3. Run training to bootstrap policy learning from demos.
4. Optionally fine-tune online with additional simulation rollouts.

## Production suggestions

- Use Docker images with Unity build dependencies and ML-Agents.
- Run scheduled jobs on Kubernetes or Cloud Run jobs.
- Persist artifacts in cloud storage.
- Publish metrics to TensorBoard and alerting/webhook systems.
- Register each model revision in Vertex AI Model Registry before deployment.
