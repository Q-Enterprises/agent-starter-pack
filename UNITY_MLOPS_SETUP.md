# Unity MLOps Setup Guide

This guide explains how to use `mlops_unity_pipeline.py` to automate a Unity + ML-Agents training workflow.

## What the pipeline does

1. Generates Unity C# behavior scripts from a natural language asset description.
2. Builds a Unity environment (headless workflow).
3. Trains agents with ML-Agents configurations (including offline RL mode).
4. Stores a model artifact and metadata.
5. Optionally registers the model in Vertex AI.

## Prerequisites

- Unity project with ML-Agents package installed.
- Python 3.10+.
- `mlagents`, `croniter`, and `pyyaml` Python packages.
- (Optional) GCP project for Vertex AI model registry.

Install minimal dependencies:

pip install "mlagents>=1.0.0,<2.0.0" croniter pyyaml

## Quick start

```python
import asyncio
from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingJob,
    UnityAssetSpec,
    UnityMLOpsOrchestrator,
)


async def main() -> None:
    orchestrator = UnityMLOpsOrchestrator(workspace_dir="./artifacts")

    asset = UnityAssetSpec(
        asset_id="nav-001",
        name="NavigationAgent",
        asset_type="behavior",
        description="Navigate around obstacles to reach a target",
        observation_space={"raycast": 8, "velocity": 2},
        action_space={"type": "continuous", "size": 2},
    )

    config = RLTrainingConfig(
        algorithm="PPO",
        max_steps=100_000,
        num_envs=16,
        time_scale=20.0,
    )

    job = TrainingJob(job_id="example-job", asset_spec=asset, rl_config=config)
    result = await orchestrator.execute_training_job(job)
    print(result)


asyncio.run(main())
```

## Scheduling recurrent training

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
        cron_expression="0 2 * * *",
        asset_specs=[
            UnityAssetSpec(
                asset_id="agent-001",
                name="SimpleAgent",
                asset_type="behavior",
                description="Reach target position",
            )
        ],
        rl_config=RLTrainingConfig(algorithm="PPO", max_steps=200_000),
    )

    scheduler.add_schedule(schedule)
    await scheduler.run_forever()


asyncio.run(run_forever())
```

## Offline RL workflow

- Record demonstrations from scripted or human gameplay.
- Store demonstration files and point `RLTrainingConfig.demonstrations_path` to them.
- Set `RLTrainingConfig.use_offline_rl = True`.
- Run offline pretraining, then optionally fine-tune with online RL.

## Production notes

- Replace placeholder `generate_unity_code` with your LLM provider call.
- Replace placeholder build/training internals with real Unity and `mlagents-learn` commands.
- Send run metrics to TensorBoard and your observability stack.
- Add webhook notifications around job start/success/failure.
