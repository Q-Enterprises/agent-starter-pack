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

"""Unit tests for project discovery helpers."""

import logging
import pathlib

import pytest

from agent_starter_pack.cli.commands.project_discovery import (
    detect_agent_directory,
    detect_language,
    get_asp_config,
    get_asp_config_for_language,
)


class TestGetAspConfig:
    """Test ASP config reading functions."""

    def test_get_asp_config_python(self, tmp_path: pathlib.Path) -> None:
        """Test reading ASP config from pyproject.toml."""
        pyproject_content = """
[project]
name = "test-agent"

[tool.agent-starter-pack]
name = "test-agent"
base_template = "adk"
agent_directory = "app"
"""
        (tmp_path / "pyproject.toml").write_text(pyproject_content)
        config = get_asp_config(tmp_path)
        assert config is not None
        assert config["name"] == "test-agent"
        assert config["base_template"] == "adk"
        assert config["agent_directory"] == "app"

    def test_get_asp_config_for_language_go(self, tmp_path: pathlib.Path) -> None:
        """Test reading ASP config from .asp.toml for Go."""
        asp_toml_content = """
[project]
name = "test-go-agent"
language = "go"
base_template = "adk_go"
"""
        (tmp_path / ".asp.toml").write_text(asp_toml_content)
        config = get_asp_config_for_language(tmp_path, "go")
        assert config is not None
        assert config["name"] == "test-go-agent"
        assert config["language"] == "go"

    def test_get_asp_config_for_language_missing_file(self, tmp_path: pathlib.Path) -> None:
        """Test handling of missing config file."""
        config = get_asp_config_for_language(tmp_path, "python")
        assert config is None

    def test_get_asp_config_for_language_unknown_language(self, tmp_path: pathlib.Path) -> None:
        """Test handling of unknown language."""
        config = get_asp_config_for_language(tmp_path, "unknown")
        assert config is None

    def test_get_asp_config_for_language_malformed_toml(self, tmp_path: pathlib.Path, caplog: pytest.LogCaptureFixture) -> None:
        """Test handling of malformed TOML."""
        with caplog.at_level(logging.DEBUG):
            (tmp_path / "pyproject.toml").write_text("invalid = [toml")
            config = get_asp_config_for_language(tmp_path, "python")
            assert config is None
            assert "Could not read config from pyproject.toml" in caplog.text

    def test_get_asp_config_for_language_missing_path(self, tmp_path: pathlib.Path) -> None:
        """Test handling of missing config path in TOML."""
        (tmp_path / "pyproject.toml").write_text("[project]\nname = 'test'")
        config = get_asp_config_for_language(tmp_path, "python")
        assert config is None

    def test_get_asp_config_for_language_invalid_path_type(self, tmp_path: pathlib.Path) -> None:
        """Test handling of invalid types in config path."""
        # 'tool' exists but is not a dict
        (tmp_path / "pyproject.toml").write_text("tool = 'not-a-dict'")
        config = get_asp_config_for_language(tmp_path, "python")
        assert config is None


class TestDetectLanguage:
    """Test language detection logic."""

    def test_detect_language_from_asp_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection from .asp.toml language field."""
        (tmp_path / ".asp.toml").write_text('[project]\nlanguage = "go"')
        assert detect_language(tmp_path) == "go"

    def test_detect_language_go_mod(self, tmp_path: pathlib.Path) -> None:
        """Test detection from go.mod."""
        (tmp_path / "go.mod").touch()
        assert detect_language(tmp_path) == "go"

    def test_detect_language_pyproject_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection from pyproject.toml."""
        (tmp_path / "pyproject.toml").touch()
        assert detect_language(tmp_path) == "python"

    def test_detect_language_default(self, tmp_path: pathlib.Path) -> None:
        """Test default to python."""
        assert detect_language(tmp_path) == "python"

    def test_detect_language_unknown_in_asp_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection when .asp.toml has an unknown language."""
        (tmp_path / ".asp.toml").write_text('[project]\nlanguage = "rust"')
        # Should fall back to python default since no other files exist
        assert detect_language(tmp_path) == "python"

    def test_detect_language_malformed_asp_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection when .asp.toml is malformed."""
        (tmp_path / ".asp.toml").write_text('invalid = [toml')
        # Should fall back to python default
        assert detect_language(tmp_path) == "python"

    def test_detect_language_missing_keys_in_asp_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection when .asp.toml is missing keys."""
        (tmp_path / ".asp.toml").write_text('[project]\nname = "foo"')
        # Should fall back to python default
        assert detect_language(tmp_path) == "python"

    def test_detect_language_empty_asp_toml(self, tmp_path: pathlib.Path) -> None:
        """Test detection when .asp.toml is empty."""
        (tmp_path / ".asp.toml").write_text('')
        # Should fall back to python default
        assert detect_language(tmp_path) == "python"


class TestDetectAgentDirectory:
    """Test agent directory detection logic."""

    def test_detect_agent_directory_from_config(self, tmp_path: pathlib.Path) -> None:
        """Test prioritization of config value."""
        asp_config = {"agent_directory": "custom_agent"}
        assert detect_agent_directory(tmp_path, asp_config) == "custom_agent"

    def test_detect_agent_directory_heuristic_app(self, tmp_path: pathlib.Path) -> None:
        """Test heuristic: app/agent.py."""
        app_dir = tmp_path / "app"
        app_dir.mkdir()
        (app_dir / "agent.py").touch()
        assert detect_agent_directory(tmp_path, None) == "app"

    def test_detect_agent_directory_heuristic_agent(self, tmp_path: pathlib.Path) -> None:
        """Test heuristic: agent/agent.py."""
        agent_dir = tmp_path / "agent"
        agent_dir.mkdir()
        (agent_dir / "agent.py").touch()
        assert detect_agent_directory(tmp_path, None) == "agent"

    def test_detect_agent_directory_heuristic_src(self, tmp_path: pathlib.Path) -> None:
        """Test heuristic: src/agent.py."""
        src_dir = tmp_path / "src"
        src_dir.mkdir()
        (src_dir / "agent.py").touch()
        assert detect_agent_directory(tmp_path, None) == "src"

    def test_detect_agent_directory_dynamic(self, tmp_path: pathlib.Path) -> None:
        """Test heuristic: any_dir/agent.py."""
        my_dir = tmp_path / "my_custom_dir"
        my_dir.mkdir()
        (my_dir / "agent.py").touch()
        assert detect_agent_directory(tmp_path, None) == "my_custom_dir"

    def test_detect_agent_directory_fallback(self, tmp_path: pathlib.Path) -> None:
        """Test fallback to app."""
        assert detect_agent_directory(tmp_path, None) == "app"
