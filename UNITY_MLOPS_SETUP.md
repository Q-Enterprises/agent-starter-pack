# Unity MLOps Pipeline Setup

This repository now includes `mlops_unity_pipeline.py`, a lightweight orchestration module for automating:

1. Unity behavior script generation.
2. Unity build artifact generation.
3. RL training job execution (stubbed local flow).
4. Model registration records (Vertex-style registry IDs).
5. Scheduled recurring training jobs.

## Quick Start

```python
import asyncio
from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingJob,
    UnityAssetSpec,
    UnityMLOpsOrchestrator,
)


async def main() -> None:
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

## Scheduled Training

Use standard cron expressions when `croniter` is installed. If `croniter` is unavailable, use:

- `@every 30s`
- `@every 15m`
- `@every 2h`
- `@every 1d`

Example:

```python
import asyncio
from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingSchedule,
    TrainingScheduler,
    UnityAssetSpec,
    UnityMLOpsOrchestrator,
)


async def run_forever() -> None:
    orchestrator = UnityMLOpsOrchestrator()
    scheduler = TrainingScheduler(orchestrator)

    schedule = TrainingSchedule(
        schedule_id="nightly",
        cron_expression="@every 1d",
        asset_specs=[
            UnityAssetSpec(
                asset_id="nav-001",
                name="NavigationAgent",
                asset_type="behavior",
                description="Navigate obstacles to reach goal",
            )
        ],
        rl_config=RLTrainingConfig(),
    )

    scheduler.add_schedule(schedule)
    await scheduler.run_forever(poll_interval_seconds=60)


asyncio.run(run_forever())
```

## Output Layout

Running jobs creates artifacts under `artifacts/`:

- `generated_scripts/*.cs`
- `unity_builds/*/build_manifest.json`
- `trained_models/*.onnx`
- `model_registry/*.json`

## Notes

- This module intentionally uses local, deterministic stubs for build/training/registry so it can run in CI and local development.
- Replace methods in `UnityMLOpsOrchestrator` with real Unity/ML-Agents/Vertex API calls for production.
