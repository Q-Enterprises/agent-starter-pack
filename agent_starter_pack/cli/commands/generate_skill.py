# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Generate a skill specification from an Agent Starter Pack project."""

import pathlib
import re
import sys
from typing import Any

import click

from .project_discovery import (
    detect_agent_directory,
    detect_language,
    get_asp_config_for_language,
)

if sys.version_info >= (3, 11):
    import tomllib
else:
    import tomli as tomllib


SUPPORTED_FORMATS = ("markdown",)


def _load_toml(path: pathlib.Path) -> dict[str, Any]:
    if not path.exists():
        return {}

    with open(path, "rb") as f:
        data = tomllib.load(f)

    return data if isinstance(data, dict) else {}


def _parse_simple_yaml_map(raw: str) -> dict[str, Any]:
    """Parse simple top-level `key: value` YAML mappings as a fallback."""
    parsed: dict[str, Any] = {}
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or ":" not in stripped:
            continue
        if line[:1].isspace():
            continue
        key, value = stripped.split(":", 1)
        parsed[key.strip()] = value.strip().strip("\"'")
    return parsed


def _load_template_config(source_dir: pathlib.Path) -> dict[str, Any]:
    config_path = source_dir / ".template" / "templateconfig.yaml"
    if not config_path.exists():
        return {}

    raw = config_path.read_text(encoding="utf-8")

    try:
        import yaml

        data = yaml.safe_load(raw)
        return data if isinstance(data, dict) else {}
    except ModuleNotFoundError:
        return _parse_simple_yaml_map(raw)


def _read_gemini_metadata(source_dir: pathlib.Path) -> dict[str, list[str]]:
    gemini_path = source_dir / "GEMINI.md"
    if not gemini_path.exists():
        return {
            "trigger_phrases": [],
            "workflow_steps": [],
            "key_files": [],
        }

    trigger_phrases: list[str] = []
    workflow_steps: list[str] = []
    key_files: list[str] = []

    trigger_pattern = re.compile(r"`([^`]+)`")
    key_file_pattern = re.compile(r"`([\w./-]+\.(?:py|go|md|toml|yaml|yml|json))`")

    for raw_line in gemini_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line.startswith(("-", "*")):
            continue

        if any(
            token in line.lower() for token in ("trigger", "when user", "user asks")
        ):
            trigger_phrases.extend(
                match.strip() for match in trigger_pattern.findall(line)
            )

        if any(
            token in line.lower() for token in ("workflow", "step", "then", "first")
        ):
            cleaned = re.sub(r"^[*-]\s*", "", line)
            workflow_steps.append(cleaned)

        key_files.extend(match for match in key_file_pattern.findall(line))

    return {
        "trigger_phrases": sorted(set(trigger_phrases)),
        "workflow_steps": workflow_steps,
        "key_files": sorted(set(key_files)),
    }


def _build_required_tools(language: str, asp_config: dict[str, Any]) -> list[str]:
    tools = ["agent-starter-pack"]

    if language == "python":
        tools.extend(["python", "uv"])
    elif language == "go":
        tools.extend(["go"])

    create_params = asp_config.get("create_params", {})
    if isinstance(create_params, dict):
        deployment_target = create_params.get("deployment_target")
        if deployment_target:
            tools.append(f"deployment:{deployment_target}")

        cicd_runner = create_params.get("cicd_runner")
        if cicd_runner and cicd_runner != "none":
            tools.append(f"cicd:{cicd_runner}")

    return sorted(set(tools))


def _build_skill_markdown(source_dir: pathlib.Path) -> str:
    language = detect_language(source_dir)
    asp_config = get_asp_config_for_language(source_dir, language) or {}
    template_config = _load_template_config(source_dir)
    gemini_metadata = _read_gemini_metadata(source_dir)

    project_data = _load_toml(source_dir / "pyproject.toml")
    project_info = project_data.get("project", {}) if isinstance(project_data, dict) else {}

    name = (
        asp_config.get("name")
        or template_config.get("name")
        or project_info.get("name")
        or source_dir.name
    )
    description = (
        asp_config.get("description")
        or template_config.get("description")
        or project_info.get("description")
        or "Generated skill documentation for this project."
    )

    agent_directory = detect_agent_directory(source_dir, asp_config)

    triggers = gemini_metadata["trigger_phrases"] or [
        f"update {name}",
        f"modify {language} agent logic",
        f"inspect {agent_directory}",
    ]

    required_tools = _build_required_tools(language, asp_config)
    workflow_steps = gemini_metadata["workflow_steps"] or [
        f"Detect project language and load ASP metadata from {source_dir / 'pyproject.toml'} when available.",
        f"Inspect agent implementation under `{agent_directory}/` and related configuration files.",
        "Apply minimal code changes and update documentation if behavior changes.",
        "Run focused CLI or unit tests before committing.",
    ]

    potential_key_files = [
        "pyproject.toml",
        ".asp.toml",
        ".template/templateconfig.yaml",
        "GEMINI.md",
    ]
    key_files: list[str] = [
        f for f in potential_key_files if (source_dir / f).exists()
    ]
    key_files.append(f"{agent_directory}/")

    key_files.extend(gemini_metadata["key_files"])
    key_files = sorted(set(key_files))

    lines = [
        "# Skill Specification",
        "",
        "## Name and Description",
        f"- **Name:** {name}",
        f"- **Description:** {description}",
        f"- **Language:** {language}",
        "",
        "## Trigger Phrases",
    ]
    lines.extend(f"- {trigger}" for trigger in triggers)

    lines.extend(["", "## Required Tools and Dependencies"])
    lines.extend(f"- {tool}" for tool in required_tools)

    lines.extend(["", "## Step-by-Step Workflow"])
    lines.extend(f"{i}. {step}" for i, step in enumerate(workflow_steps, start=1))

    lines.extend(["", "## Key Files and Functions to Inspect"])
    lines.extend(f"- {path}" for path in key_files)

    return "\n".join(lines) + "\n"


@click.command("generate-skill")
@click.option(
    "--source",
    type=click.Path(exists=True, file_okay=False, path_type=pathlib.Path),
    default=".",
    show_default=True,
    help="Source project directory.",
)
@click.option(
    "--output",
    type=click.Path(path_type=pathlib.Path),
    default="skills.md",
    show_default=True,
    help="Output file path for generated skill content.",
)
@click.option(
    "--format",
    "output_format",
    type=click.Choice(SUPPORTED_FORMATS),
    default="markdown",
    show_default=True,
    help="Output format.",
)
def generate_skill(source: pathlib.Path, output: pathlib.Path, output_format: str) -> None:
    """Generate skill documentation from project metadata and conventions."""
    if output_format != "markdown":
        raise click.ClickException(f"Unsupported format: {output_format}")

    content = _build_skill_markdown(source.resolve())
    output.write_text(content, encoding="utf-8")
    click.echo(f"Generated {output_format} skill file: {output}")
