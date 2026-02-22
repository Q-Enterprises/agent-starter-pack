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

"""Language and project discovery helpers shared by CLI commands."""

import logging
import pathlib
import sys
from typing import Any

if sys.version_info >= (3, 11):
    import tomllib
else:
    import tomli as tomllib


LANGUAGE_CONFIGS: dict[str, dict[str, Any]] = {
    "python": {
        "detection_files": ["pyproject.toml"],
        "config_file": "pyproject.toml",
        "config_path": ["tool", "agent-starter-pack"],
        "project_files": ["pyproject.toml"],
        "lock_file": "uv.lock",
        "lock_command": ["uv", "lock"],
        "lock_command_name": "uv lock",
        "strip_dependencies": True,
        "display_name": "Python",
    },
    "go": {
        "detection_files": ["go.mod"],
        "config_file": ".asp.toml",
        "config_path": ["project"],
        "project_files": ["go.mod", "go.sum", ".asp.toml"],
        "lock_file": "go.sum",
        "lock_command": ["go", "mod", "tidy"],
        "lock_command_name": "go mod tidy",
        "strip_dependencies": False,
        "display_name": "Go",
    },
}


def detect_agent_directory(
    project_dir: pathlib.Path, asp_config: dict[str, Any] | None
) -> str:
    """Detect the agent directory from config or heuristics."""
    if asp_config and asp_config.get("agent_directory"):
        return asp_config["agent_directory"]

    for candidate in ["app", "agent", "src"]:
        candidate_path = project_dir / candidate
        if candidate_path.is_dir() and (candidate_path / "agent.py").exists():
            return candidate

    for item in project_dir.iterdir():
        if (
            item.is_dir()
            and not item.name.startswith(".")
            and (item / "agent.py").exists()
        ):
            return item.name

    return "app"


def detect_language(project_dir: pathlib.Path) -> str:
    """Detect the project language using LANGUAGE_CONFIGS."""
    asp_toml_path = project_dir / ".asp.toml"
    if asp_toml_path.exists():
        try:
            with open(asp_toml_path, "rb") as f:
                asp_data = tomllib.load(f)
            language = asp_data.get("project", {}).get("language")
            if language and language in LANGUAGE_CONFIGS:
                return language
        except Exception:
            pass

    for lang in ["go", "python"]:
        config = LANGUAGE_CONFIGS.get(lang)
        if not config:
            continue

        for detection_file in config.get("detection_files", []):
            if (project_dir / detection_file).exists():
                return lang

    return "python"


def get_asp_config_for_language(
    project_dir: pathlib.Path, language: str
) -> dict[str, Any] | None:
    """Read ASP config based on language configuration."""
    lang_config = LANGUAGE_CONFIGS.get(language)
    if not lang_config:
        return None

    config_file = lang_config.get("config_file")
    config_path = lang_config.get("config_path", [])

    if not config_file:
        return None

    config_file_path = project_dir / config_file
    if not config_file_path.exists():
        return None

    try:
        with open(config_file_path, "rb") as f:
            data = tomllib.load(f)

        result = data
        for key in config_path:
            if isinstance(result, dict):
                result = result.get(key)
            else:
                return None
            if result is None:
                return None

        return result if isinstance(result, dict) else None
    except Exception as e:
        logging.debug(f"Could not read config from {config_file}: {e}")
        return None


def get_asp_config(project_dir: pathlib.Path) -> dict[str, Any] | None:
    """Read ASP config from pyproject.toml for backward compatibility."""
    return get_asp_config_for_language(project_dir, "python")
