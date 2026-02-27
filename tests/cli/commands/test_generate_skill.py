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

"""Tests for generate-skill CLI command."""

import pathlib

from click.testing import CliRunner

from agent_starter_pack.cli.commands.generate_skill import generate_skill


def test_generate_skill_python_project(tmp_path: pathlib.Path) -> None:
    """Generates markdown using Python project metadata."""
    (tmp_path / "app").mkdir()
    (tmp_path / "app" / "agent.py").write_text("def run():\n    return True\n")
    (tmp_path / "pyproject.toml").write_text(
        """
[project]
name = "weather-agent"
description = "Weather assistant"

[tool.agent-starter-pack]
name = "weather-agent"
description = "Assist users with weather"
agent_directory = "app"

[tool.agent-starter-pack.create_params]
deployment_target = "cloud_run"
cicd_runner = "github_actions"
""".strip()
    )
    (tmp_path / "GEMINI.md").write_text(
        """
- trigger phrase: `create weather workflow`
- workflow step: collect requirements
- workflow step: update app/agent.py
- key file: `app/agent.py`
""".strip()
    )

    output = tmp_path / "skills.md"
    runner = CliRunner()
    result = runner.invoke(
        generate_skill,
        ["--source", str(tmp_path), "--output", str(output)],
    )

    assert result.exit_code == 0
    content = output.read_text()
    assert "**Name:** weather-agent" in content
    assert "Assist users with weather" in content
    assert "- create weather workflow" in content
    assert "- python" in content
    assert "- deployment:cloud_run" in content
    assert "- cicd:github_actions" in content
    assert "app/agent.py" in content


def test_generate_skill_go_project(tmp_path: pathlib.Path) -> None:
    """Uses Go discovery and .asp.toml metadata."""
    (tmp_path / "agent").mkdir()
    (tmp_path / "agent" / "agent.py").write_text("# placeholder for detection\n")
    (tmp_path / "go.mod").write_text("module example.com/myagent\ngo 1.23\n")
    (tmp_path / ".asp.toml").write_text(
        """
[project]
language = "go"
name = "go-agent"
description = "Go based agent"
agent_directory = "agent"
""".strip()
    )

    output = tmp_path / "skills-go.md"
    runner = CliRunner()
    result = runner.invoke(
        generate_skill,
        ["--source", str(tmp_path), "--output", str(output)],
    )

    assert result.exit_code == 0
    content = output.read_text()
    assert "**Language:** go" in content
    assert "**Name:** go-agent" in content
    assert "- go" in content
    assert "- .asp.toml" in content


def test_generate_skill_missing_metadata_fallback(tmp_path: pathlib.Path) -> None:
    """Falls back to deterministic defaults when metadata is missing."""
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "agent.py").write_text("def main():\n    pass\n")

    output = tmp_path / "skills.md"
    runner = CliRunner()
    result = runner.invoke(
        generate_skill,
        ["--source", str(tmp_path), "--output", str(output)],
    )

    assert result.exit_code == 0
    content = output.read_text()
    assert "Generated skill documentation for this project." in content
    assert f"**Name:** {tmp_path.name}" in content
    assert "- inspect src" in content
    assert "- src/" in content
