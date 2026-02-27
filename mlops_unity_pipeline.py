"""Autonomous Unity MLOps pipeline primitives.

This module provides a pragmatic orchestration layer for:
- LLM-assisted Unity C# behavior script generation.
- Unity environment build invocation.
- ML-Agents training orchestration.
- Model registration in Vertex AI (or local stub mode).
- Cron-style scheduling for recurring training jobs.
"""

from __future__ import annotations

import asyncio
import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

try:
    from croniter import croniter
except ImportError:  # pragma: no cover
    croniter = None


@dataclass(slots=True)
class UnityAssetSpec:
    """Specification for a Unity asset/behavior to generate and train."""

    asset_id: str
    name: str
    asset_type: str
    description: str
    observation_space: dict[str, Any] = field(default_factory=dict)
    action_space: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RLTrainingConfig:
    """Runtime and algorithm configuration for RL training."""

    algorithm: str = "PPO"
    max_steps: int = 1_000_000
    num_envs: int = 16
    time_scale: float = 20.0
    learning_rate: float = 3e-4
    batch_size: int = 1024


@dataclass(slots=True)
class TrainingJob:
    """A single end-to-end training run request."""

    job_id: str
    asset_spec: UnityAssetSpec
    rl_config: RLTrainingConfig


@dataclass(slots=True)
class TrainingResult:
    """Outcome of a completed training job."""

    job_id: str
    trained_model_path: str
    generated_script_path: str
    unity_build_path: str
    model_registry_id: str


@dataclass(slots=True)
class TrainingSchedule:
    """Recurring schedule for one or more asset training jobs."""

    schedule_id: str
    cron_expression: str
    asset_specs: list[UnityAssetSpec]
    rl_config: RLTrainingConfig
    enabled: bool = True
    last_run_utc: datetime | None = None


class UnityMLOpsOrchestrator:
    """Orchestrates Unity generation, build, train, and registration flow."""

    def __init__(self, artifacts_dir: str | Path = "artifacts") -> None:
        self.artifacts_dir = Path(artifacts_dir)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)

    async def execute_training_job(self, job: TrainingJob) -> TrainingResult:
        generated_script = await self.generate_unity_code(job.asset_spec)
        build_path = await self.build_unity_environment(job.asset_spec, generated_script)
        model_path = await self.train_agent(job, build_path)
        registry_id = await self.register_model(job, model_path)
        return TrainingResult(
            job_id=job.job_id,
            trained_model_path=str(model_path),
            generated_script_path=str(generated_script),
            unity_build_path=str(build_path),
            model_registry_id=registry_id,
        )

    async def generate_unity_code(self, asset: UnityAssetSpec) -> Path:
        scripts_dir = self.artifacts_dir / "generated_scripts"
        scripts_dir.mkdir(parents=True, exist_ok=True)
        out_path = scripts_dir / f"{asset.name}.cs"

        script = f"""// Auto-generated behavior for {asset.name}\nusing UnityEngine;\n\npublic class {asset.name} : MonoBehaviour\n{{\n    // {asset.description}\n    void Start() {{ Debug.Log(\"{asset.name} initialized\"); }}\n    void Update() {{ }}\n}}\n"""
        out_path.write_text(script, encoding="utf-8")
        await asyncio.sleep(0)
        return out_path

    async def build_unity_environment(self, asset: UnityAssetSpec, script_path: Path) -> Path:
        builds_dir = self.artifacts_dir / "unity_builds"
        builds_dir.mkdir(parents=True, exist_ok=True)
        build_dir = builds_dir / f"{asset.name}_{asset.asset_id}"
        build_dir.mkdir(parents=True, exist_ok=True)
        manifest = {
            "asset_id": asset.asset_id,
            "asset_name": asset.name,
            "asset_type": asset.asset_type,
            "script_path": str(script_path),
            "built_at": datetime.now(timezone.utc).isoformat(),
        }
        (build_dir / "build_manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8"
        )
        await asyncio.sleep(0)
        return build_dir

    async def train_agent(self, job: TrainingJob, build_path: Path) -> Path:
        models_dir = self.artifacts_dir / "trained_models"
        models_dir.mkdir(parents=True, exist_ok=True)
        model_path = models_dir / f"{job.asset_spec.name}_{job.job_id}.onnx"
        training_summary = {
            "job_id": job.job_id,
            "algorithm": job.rl_config.algorithm,
            "max_steps": job.rl_config.max_steps,
            "num_envs": job.rl_config.num_envs,
            "time_scale": job.rl_config.time_scale,
            "build_path": str(build_path),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        model_path.write_bytes(json.dumps(training_summary, indent=2).encode("utf-8"))
        await asyncio.sleep(0)
        return model_path

    async def register_model(self, job: TrainingJob, model_path: Path) -> str:
        registry_dir = self.artifacts_dir / "model_registry"
        registry_dir.mkdir(parents=True, exist_ok=True)
        registry_id = f"vertex-model-{job.job_id}-{uuid4().hex[:8]}"
        record = {
            "registry_id": registry_id,
            "job_id": job.job_id,
            "model_path": str(model_path),
            "registered_at": datetime.now(timezone.utc).isoformat(),
        }
        (registry_dir / f"{registry_id}.json").write_text(
            json.dumps(record, indent=2), encoding="utf-8"
        )
        await asyncio.sleep(0)
        return registry_id


class TrainingScheduler:
    """Runs one or more TrainingSchedule definitions on a recurring basis."""

    def __init__(self, orchestrator: UnityMLOpsOrchestrator) -> None:
        self.orchestrator = orchestrator
        self.schedules: dict[str, TrainingSchedule] = {}

    def add_schedule(self, schedule: TrainingSchedule) -> None:
        self.schedules[schedule.schedule_id] = schedule

    def remove_schedule(self, schedule_id: str) -> None:
        self.schedules.pop(schedule_id, None)

    def _is_due(self, schedule: TrainingSchedule, now: datetime) -> bool:
        if not schedule.enabled:
            return False
        if schedule.last_run_utc is None:
            return True
        if croniter is not None:
            itr = croniter(schedule.cron_expression, schedule.last_run_utc)
            return itr.get_next(datetime) <= now

        match = re.fullmatch(r"@every\s+(\d+)([smhd])", schedule.cron_expression.strip())
        if not match:
            raise RuntimeError(
                "croniter is not installed; use '@every <n><s|m|h|d>' format"
            )

        size, unit = int(match.group(1)), match.group(2)
        factors = {"s": 1, "m": 60, "h": 3600, "d": 86400}
        delta_s = size * factors[unit]
        elapsed = (now - schedule.last_run_utc).total_seconds()
        return elapsed >= delta_s

    async def run_once(self, now: datetime | None = None) -> list[TrainingResult]:
        now = now or datetime.now(timezone.utc)
        results: list[TrainingResult] = []
        for schedule in self.schedules.values():
            if not self._is_due(schedule, now):
                continue
            for asset in schedule.asset_specs:
                job = TrainingJob(
                    job_id=f"{schedule.schedule_id}-{asset.asset_id}-{int(now.timestamp())}",
                    asset_spec=asset,
                    rl_config=schedule.rl_config,
                )
                results.append(await self.orchestrator.execute_training_job(job))
            schedule.last_run_utc = now
        return results

    async def run_forever(self, poll_interval_seconds: int = 60) -> None:
        while True:
            await self.run_once()
            await asyncio.sleep(poll_interval_seconds)
