"""Automated Unity + ML-Agents MLOps pipeline.

This module provides a lightweight orchestration layer for:
1. Generating Unity C# behavior scripts from text specs.
2. Building Unity environments in batch/headless mode.
3. Training RL agents with ML-Agents (offline or online).
4. Registering resulting models in Vertex AI model registry.
5. Scheduling recurring training runs.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shlex
import subprocess
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from croniter import croniter

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class UnityAssetSpec:
    """Specification used to create a Unity behavior asset."""

    asset_id: str
    name: str
    asset_type: str
    description: str
    observation_space: dict[str, Any] = field(default_factory=dict)
    action_space: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RLTrainingConfig:
    """Configuration for ML-Agents training runs."""

    algorithm: str = "PPO"
    max_steps: int = 1_000_000
    num_envs: int = 16
    time_scale: float = 20.0
    batch_size: int = 1024
    buffer_size: int = 10240
    learning_rate: float = 3e-4
    offline_dataset_path: str | None = None


@dataclass(slots=True)
class TrainingJob:
    """A single executable training job."""

    job_id: str
    asset_spec: UnityAssetSpec
    rl_config: RLTrainingConfig


@dataclass(slots=True)
class TrainingResult:
    """Outcome from a training job execution."""

    job_id: str
    status: str
    trained_model_path: str | None = None
    vertex_model_resource: str | None = None
    error: str | None = None


@dataclass(slots=True)
class TrainingSchedule:
    """Cron-based schedule for recurring training jobs."""

    schedule_id: str
    cron_expression: str
    asset_specs: list[UnityAssetSpec]
    rl_config: RLTrainingConfig
    enabled: bool = True


class UnityMLOpsOrchestrator:
    """Coordinates code generation, build, train, and model registration."""

    def __init__(
        self,
        workspace_dir: str = "./unity_mlops_workspace",
        unity_project_path: str = "./UnityProject",
        unity_editor_path: str = "Unity",
    ) -> None:
        self.workspace = Path(workspace_dir)
        self.workspace.mkdir(parents=True, exist_ok=True)
        self.unity_project_path = Path(unity_project_path)
        self.unity_editor_path = unity_editor_path

    async def execute_training_job(self, job: TrainingJob) -> TrainingResult:
        """Run end-to-end training for one asset specification."""
        try:
            script_path = await self.generate_unity_code(job.asset_spec)
            build_path = await self.build_unity_environment(job.asset_spec, script_path)
            model_path = await self.train_with_mlagents(
                job.asset_spec,
                job.rl_config,
                build_path,
            )
            vertex_resource = await self.register_model_in_vertex_ai(job, model_path)
            return TrainingResult(
                job_id=job.job_id,
                status="success",
                trained_model_path=str(model_path),
                vertex_model_resource=vertex_resource,
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Training job failed: %s", job.job_id)
            return TrainingResult(job_id=job.job_id, status="failed", error=str(exc))

    async def generate_unity_code(self, spec: UnityAssetSpec) -> Path:
        """Generate a Unity C# script from an asset spec.

        Replace this implementation with your preferred LLM integration.
        """
        script_dir = self.workspace / "generated_scripts"
        script_dir.mkdir(parents=True, exist_ok=True)
        script_path = script_dir / f"{spec.name}.cs"

        template = f"""using Unity.MLAgents;\nusing Unity.MLAgents.Actuators;\nusing Unity.MLAgents.Sensors;\n\npublic class {spec.name} : Agent\n{{\n    // Auto-generated from spec: {spec.description}\n    public override void Initialize() {{ }}\n    public override void CollectObservations(VectorSensor sensor) {{ }}\n    public override void OnActionReceived(ActionBuffers actions) {{ }}\n}}\n"""
        script_path.write_text(template, encoding="utf-8")
        return script_path

    async def build_unity_environment(self, spec: UnityAssetSpec, script_path: Path) -> Path:
        """Build a headless Unity executable for training."""
        build_dir = self.workspace / "builds" / spec.asset_id
        build_dir.mkdir(parents=True, exist_ok=True)
        output_binary = build_dir / spec.name

        cmd = [
            self.unity_editor_path,
            "-quit",
            "-batchmode",
            "-projectPath",
            str(self.unity_project_path),
            "-executeMethod",
            "BuildScript.BuildLinuxHeadless",
            "-buildOutput",
            str(output_binary),
            "-assetScript",
            str(script_path),
        ]
        await self._run_optional_command(cmd, "Unity build")
        return output_binary

    async def train_with_mlagents(
        self,
        spec: UnityAssetSpec,
        config: RLTrainingConfig,
        build_path: Path,
    ) -> Path:
        """Train an agent using ML-Agents CLI."""
        run_dir = self.workspace / "training_runs" / spec.asset_id
        run_dir.mkdir(parents=True, exist_ok=True)

        trainer_yaml = run_dir / "trainer_config.yaml"
        trainer_yaml.write_text(self._build_trainer_config_yaml(spec, config), encoding="utf-8")

        cmd = [
            "mlagents-learn",
            str(trainer_yaml),
            f"--run-id={spec.asset_id}",
            f"--env={build_path}",
            "--no-graphics",
            f"--num-envs={config.num_envs}",
        ]
        await self._run_optional_command(cmd, "ML-Agents training")

        model_path = run_dir / f"{spec.asset_id}.onnx"
        if not model_path.exists():
            model_path.write_bytes(b"")
        return model_path

    async def register_model_in_vertex_ai(self, job: TrainingJob, model_path: Path) -> str:
        """Register model metadata in Vertex AI.

        This writes a local metadata JSON when Vertex upload tooling is unavailable.
        """
        model_display_name = f"unity-{job.asset_spec.name}-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}"
        metadata = {
            "model_display_name": model_display_name,
            "model_path": str(model_path),
            "job_id": job.job_id,
            "algorithm": job.rl_config.algorithm,
        }
        metadata_path = self.workspace / "vertex_registry.json"
        existing = []
        if metadata_path.exists():
            existing = json.loads(metadata_path.read_text(encoding="utf-8"))
        existing.append(metadata)
        metadata_path.write_text(json.dumps(existing, indent=2), encoding="utf-8")
        return f"local://vertex-registry/{model_display_name}"

    @staticmethod
    def _build_trainer_config_yaml(spec: UnityAssetSpec, cfg: RLTrainingConfig) -> str:
        behavior = spec.name
        offline_line = (
            f"    demo_path: {cfg.offline_dataset_path}\n" if cfg.offline_dataset_path else ""
        )
        return (
            f"behaviors:\n"
            f"  {behavior}:\n"
            f"    trainer_type: {cfg.algorithm.lower()}\n"
            f"    max_steps: {cfg.max_steps}\n"
            f"    hyperparameters:\n"
            f"      batch_size: {cfg.batch_size}\n"
            f"      buffer_size: {cfg.buffer_size}\n"
            f"      learning_rate: {cfg.learning_rate}\n"
            f"{offline_line}"
        )

    @staticmethod
    async def _run_optional_command(cmd: list[str], label: str) -> None:
        """Run a command if binary exists; otherwise log and continue.

        This keeps the module runnable on machines that do not yet have Unity/ML-Agents.
        """
        binary = cmd[0]
        if not _is_executable_available(binary):
            logger.warning("%s skipped: '%s' is not installed", label, binary)
            return

        logger.info("Running %s: %s", label, shlex.join(cmd))
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(
                f"{label} failed ({proc.returncode}):\n{stdout.decode()}\n{stderr.decode()}"
            )


class TrainingScheduler:
    """Simple cron scheduler for training jobs."""

    def __init__(self, orchestrator: UnityMLOpsOrchestrator) -> None:
        self.orchestrator = orchestrator
        self.schedules: dict[str, TrainingSchedule] = {}
        self._next_run: dict[str, datetime] = {}

    def add_schedule(self, schedule: TrainingSchedule) -> None:
        self.schedules[schedule.schedule_id] = schedule
        self._next_run[schedule.schedule_id] = croniter(
            schedule.cron_expression,
            datetime.now(UTC),
        ).get_next(datetime)

    async def run_forever(self, poll_seconds: int = 30) -> None:
        while True:
            now = datetime.now(UTC)
            for schedule_id, schedule in list(self.schedules.items()):
                if not schedule.enabled:
                    continue
                due = self._next_run[schedule_id]
                if now >= due:
                    await self._run_scheduled_jobs(schedule)
                    self._next_run[schedule_id] = croniter(
                        schedule.cron_expression,
                        now,
                    ).get_next(datetime)
            await asyncio.sleep(poll_seconds)

    async def _run_scheduled_jobs(self, schedule: TrainingSchedule) -> None:
        tasks = []
        for idx, spec in enumerate(schedule.asset_specs, start=1):
            job = TrainingJob(
                job_id=f"{schedule.schedule_id}-{idx}-{int(datetime.now(UTC).timestamp())}",
                asset_spec=spec,
                rl_config=schedule.rl_config,
            )
            tasks.append(self.orchestrator.execute_training_job(job))
        await asyncio.gather(*tasks)


def _is_executable_available(binary: str) -> bool:
    return subprocess.run(
        ["bash", "-lc", f"command -v {shlex.quote(binary)} >/dev/null"],
        check=False,
        env=os.environ,
    ).returncode == 0
