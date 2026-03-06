import argparse
import contextlib
import json
import os
import socket
import subprocess
import sys
import time
from collections.abc import Sequence
from dataclasses import asdict, dataclass


@dataclass
class VerifyResult:
    ok: bool
    reason: str
    details: str = ""


def _is_endpoint_ready(host: str, port: int, timeout_seconds: float = 0.2) -> bool:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.settimeout(timeout_seconds)
        return sock.connect_ex((host, port)) == 0


def wait_for_readiness(
    process: subprocess.Popen,
    host: str,
    port: int,
    startup_timeout_seconds: float,
    poll_interval_seconds: float = 0.1,
) -> VerifyResult:
    deadline = time.monotonic() + startup_timeout_seconds
    while time.monotonic() < deadline:
        if process.poll() is not None:
            return VerifyResult(
                ok=False,
                reason="process_exited",
                details=f"Server process exited early with code {process.returncode}",
            )
        if _is_endpoint_ready(host, port):
            return VerifyResult(ok=True, reason="ready")
        time.sleep(poll_interval_seconds)

    return VerifyResult(
        ok=False,
        reason="startup_timeout",
        details=f"Endpoint {host}:{port} was not ready within {startup_timeout_seconds:.1f}s",
    )


def cleanup_process(process: subprocess.Popen, timeout_seconds: float = 3.0) -> None:
    if process.poll() is None:
        process.terminate()
    try:
        process.communicate(timeout=timeout_seconds)
    except subprocess.TimeoutExpired:
        process.kill()
        process.communicate()


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify MCP Avatar Forge UI startup.")
    parser.add_argument(
        "--host",
        default=os.getenv("VERIFY_MCP_HOST", "localhost"),
        help="Host to verify (default: VERIFY_MCP_HOST or localhost)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("VERIFY_MCP_PORT", "5173")),
        help="Port to verify (default: VERIFY_MCP_PORT or 5173)",
    )
    parser.add_argument(
        "--path",
        default=os.getenv("VERIFY_MCP_PATH", "/"),
        help="Path to verify (default: VERIFY_MCP_PATH or /)",
    )
    parser.add_argument(
        "--startup-timeout",
        type=float,
        default=float(os.getenv("VERIFY_MCP_STARTUP_TIMEOUT", "15")),
        help="Max seconds to wait for server readiness",
    )
    parser.add_argument(
        "--server-cwd",
        default=os.getenv(
            "VERIFY_MCP_SERVER_CWD",
            "agent_starter_pack/resources/cie_v1/mcp_avatar_forge",
        ),
        help="Working directory used for the dev server command",
    )
    return parser.parse_args(argv)


def verify_ui(
    host: str = "localhost",
    port: int = 5173,
    path: str = "/",
    startup_timeout_seconds: float = 15,
    server_cwd: str = "agent_starter_pack/resources/cie_v1/mcp_avatar_forge",
) -> VerifyResult:
    print("Starting verification...")

    # Start the Vite server
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=server_cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    try:
        readiness = wait_for_readiness(
            process=process,
            host=host,
            port=port,
            startup_timeout_seconds=startup_timeout_seconds,
        )
        if not readiness.ok:
            return readiness

        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:
            return VerifyResult(
                ok=False,
                reason="missing_playwright",
                details=f"playwright is not installed: {exc}",
            )

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            url = f"http://{host}:{port}{path}"

            print(f"Navigating to {url}")
            try:
                page.goto(url, timeout=10000)
            except Exception as e:
                return VerifyResult(
                    ok=False,
                    reason="navigation_failed",
                    details=str(e),
                )

            page.wait_for_load_state("networkidle")

            # Verify title
            title = page.title()
            print(f"Page title: {title}")

            # Verify specific text
            if page.locator("text=MCP Avatar Forge").count() > 0:
                print("✅ Found 'MCP Avatar Forge'")
            else:
                print("❌ 'MCP Avatar Forge' not found")

            if page.locator("text=Token Capsules").count() > 0:
                print("✅ Found 'Token Capsules'")
            else:
                print("❌ 'Token Capsules' not found")

            page.screenshot(path="mcp_forge_screenshot.png")
            print("Screenshot saved to mcp_forge_screenshot.png")

            browser.close()
            return VerifyResult(ok=True, reason="success", details="Verification passed")

    finally:
        cleanup_process(process)
        print("Server process stopped")


if __name__ == "__main__":
    args = parse_args()
    result = verify_ui(
        host=args.host,
        port=args.port,
        path=args.path,
        startup_timeout_seconds=args.startup_timeout,
        server_cwd=args.server_cwd,
    )
    if not result.ok:
        print(json.dumps(asdict(result), indent=2))
        sys.exit(1)
