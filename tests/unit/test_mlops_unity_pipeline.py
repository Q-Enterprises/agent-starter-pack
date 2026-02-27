from datetime import datetime, timedelta, timezone

import asyncio

from mlops_unity_pipeline import (
    RLTrainingConfig,
    TrainingJob,
    TrainingSchedule,
    TrainingScheduler,
    UnityAssetSpec,
    UnityMLOpsOrchestrator,
)


def test_orchestrator_executes_training_job(tmp_path):
    orchestrator = UnityMLOpsOrchestrator(artifacts_dir=tmp_path)
    asset = UnityAssetSpec(
        asset_id="a1",
        name="SimpleAgent",
        asset_type="behavior",
        description="Reach target",
    )
    job = TrainingJob(job_id="job-1", asset_spec=asset, rl_config=RLTrainingConfig())

    result = asyncio.run(orchestrator.execute_training_job(job))

    assert result.job_id == "job-1"
    assert (tmp_path / "generated_scripts" / "SimpleAgent.cs").exists()
    assert (tmp_path / "trained_models" / "SimpleAgent_job-1.onnx").exists()
    assert result.model_registry_id.startswith("vertex-model-job-1-")


def test_scheduler_runs_due_schedule(tmp_path):
    orchestrator = UnityMLOpsOrchestrator(artifacts_dir=tmp_path)
    scheduler = TrainingScheduler(orchestrator)

    schedule = TrainingSchedule(
        schedule_id="nightly",
        cron_expression="@every 1h",
        asset_specs=[
            UnityAssetSpec(
                asset_id="a2",
                name="NightAgent",
                asset_type="behavior",
                description="Patrol",
            )
        ],
        rl_config=RLTrainingConfig(),
    )
    schedule.last_run_utc = datetime.now(timezone.utc) - timedelta(hours=2)
    scheduler.add_schedule(schedule)

    results = asyncio.run(scheduler.run_once(now=datetime.now(timezone.utc)))

    assert len(results) == 1
    assert results[0].job_id.startswith("nightly-a2-")
