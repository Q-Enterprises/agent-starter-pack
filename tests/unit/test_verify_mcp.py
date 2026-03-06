import socket
import subprocess
import sys
import types

import verify_mcp


def _get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def test_wait_for_readiness_handles_delayed_startup():
    port = _get_free_port()
    proc = subprocess.Popen(
        [
            sys.executable,
            "-c",
            (
                "import http.server, time;"
                "time.sleep(0.5);"
                f"http.server.ThreadingHTTPServer(('127.0.0.1', {port}), http.server.SimpleHTTPRequestHandler).serve_forever()"
            ),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        result = verify_mcp.wait_for_readiness(
            process=proc,
            host="127.0.0.1",
            port=port,
            startup_timeout_seconds=3,
            poll_interval_seconds=0.05,
        )
        assert result.ok is True
        assert result.reason == "ready"
    finally:
        verify_mcp.cleanup_process(proc)


def test_wait_for_readiness_returns_process_exited_when_server_dies():
    proc = subprocess.Popen(
        [sys.executable, "-c", "import time; time.sleep(0.1)"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    result = verify_mcp.wait_for_readiness(
        process=proc,
        host="127.0.0.1",
        port=_get_free_port(),
        startup_timeout_seconds=2,
        poll_interval_seconds=0.05,
    )

    assert result.ok is False
    assert result.reason == "process_exited"


class _TimeoutThenExitProcess:
    def __init__(self):
        self.terminated = False
        self.killed = False
        self.communicate_calls = 0

    def poll(self):
        return None

    def terminate(self):
        self.terminated = True

    def communicate(self, timeout=None):
        self.communicate_calls += 1
        if self.communicate_calls == 1:
            raise subprocess.TimeoutExpired(cmd="fake", timeout=timeout)
        return ("", "")

    def kill(self):
        self.killed = True


def test_cleanup_process_terminates_then_kills_on_timeout():
    proc = _TimeoutThenExitProcess()
    verify_mcp.cleanup_process(proc, timeout_seconds=0.01)

    assert proc.terminated is True
    assert proc.killed is True
    assert proc.communicate_calls == 2


def test_parse_args_supports_env_and_cli_overrides(monkeypatch):
    monkeypatch.setenv("VERIFY_MCP_PORT", "6000")
    args = verify_mcp.parse_args(["--port", "7000", "--path", "/custom"])

    assert args.port == 7000
    assert args.path == "/custom"


class _FakePage:
    def goto(self, *_args, **_kwargs):
        raise RuntimeError("boom")


class _FakeBrowser:
    def new_page(self):
        return _FakePage()

    def close(self):
        return None


class _FakePlaywrightManager:
    def __enter__(self):
        return types.SimpleNamespace(
            chromium=types.SimpleNamespace(launch=lambda: _FakeBrowser())
        )

    def __exit__(self, exc_type, exc, tb):
        return False


class _FakeProcess:
    returncode = None

    def poll(self):
        return None

    def terminate(self):
        return None

    def communicate(self, timeout=None):
        return ("", "")


def test_verify_ui_returns_structured_navigation_failure(monkeypatch):
    monkeypatch.setattr(verify_mcp, "wait_for_readiness", lambda **_kwargs: verify_mcp.VerifyResult(ok=True, reason="ready"))
    monkeypatch.setattr(verify_mcp.subprocess, "Popen", lambda *args, **kwargs: _FakeProcess())

    fake_module = types.ModuleType("playwright.sync_api")
    fake_module.sync_playwright = lambda: _FakePlaywrightManager()
    monkeypatch.setitem(sys.modules, "playwright.sync_api", fake_module)

    result = verify_mcp.verify_ui(startup_timeout_seconds=0.1)

    assert result.ok is False
    assert result.reason == "navigation_failed"
    assert "boom" in result.details


def test_verify_ui_returns_structured_startup_failure(monkeypatch):
    monkeypatch.setattr(verify_mcp, "wait_for_readiness", lambda **_kwargs: verify_mcp.VerifyResult(ok=False, reason="startup_timeout", details="timed out"))
    monkeypatch.setattr(verify_mcp.subprocess, "Popen", lambda *args, **kwargs: _FakeProcess())

    result = verify_mcp.verify_ui(startup_timeout_seconds=0.1)

    assert result.ok is False
    assert result.reason == "startup_timeout"
    assert result.details == "timed out"
