import time
import subprocess
import sys
import os
from playwright.sync_api import sync_playwright

def verify_ui():
    print("Starting verification...")

    # Start the Vite server
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="agent_starter_pack/resources/cie_v1/mcp_avatar_forge",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        time.sleep(5)  # Wait for server to start

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            print("Navigating to http://localhost:5173")
            try:
                page.goto("http://localhost:5173", timeout=10000)
            except Exception as e:
                print(f"Failed to navigate: {e}")
                # Try to read stdout/stderr
                out, err = process.communicate(timeout=1)
                print(f"Stdout: {out.decode()}")
                print(f"Stderr: {err.decode()}")
                return False

            time.sleep(2)

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
            return True

    finally:
        process.kill()
        print("Server process killed")

if __name__ == "__main__":
    success = verify_ui()
    if not success:
        sys.exit(1)
