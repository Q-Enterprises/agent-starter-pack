import sys
import subprocess
import time
from playwright.sync_api import sync_playwright

def run_verification():
    print("Starting verification...")

    # Start the dev server in the background
    server_process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", "5173"],
        cwd="agent_starter_pack/resources/cie_v1/mcp_avatar_forge",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Wait for the server to be ready
    print("Waiting for server to start...")
    time.sleep(10)  # Give it a few seconds

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Navigate to the dashboard
            print("Navigating to http://localhost:5173/")
            try:
                page.goto("http://localhost:5173/", timeout=10000)
            except Exception as e:
                print(f"Failed to load page: {e}")
                # Check if port is open
                try:
                    import socket
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    result = sock.connect_ex(('localhost', 5173))
                    if result == 0:
                        print("Port 5173 is open")
                    else:
                        print("Port 5173 is closed")
                    sock.close()
                except:
                    pass
                raise e

            # Check for key elements
            title = page.title()
            print(f"Page title: {title}")

            # Check for Sidebar links
            print("Checking Sidebar links...")
            sidebar_text = page.locator("nav").text_content()
            if "Policy Simulator" not in sidebar_text:
                print("Sidebar text found:", sidebar_text)
                raise Exception("Policy Simulator link missing")
            if "Receipt Debugger" not in sidebar_text:
                raise Exception("Receipt Debugger link missing")

            # Navigate to Policy Simulator
            print("Navigating to Policy Simulator...")
            page.click("text=Policy Simulator")
            page.wait_for_selector("text=Token Spend Meter")
            print("Policy Simulator verified.")

            # Navigate to Receipt Debugger
            print("Navigating to Receipt Debugger...")
            page.click("text=Receipt Debugger")
            page.wait_for_selector("text=Cryptographic verification tool")
            print("Receipt Debugger verified.")

            # Take a screenshot
            page.screenshot(path="mcp_forge_verification.png")
            print("Screenshot saved to mcp_forge_verification.png")

            browser.close()
            print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        # Print server output for debugging
        stdout, stderr = server_process.communicate()
        print("Server STDOUT:", stdout)
        print("Server STDERR:", stderr)
        sys.exit(1)
    finally:
        server_process.terminate()

if __name__ == "__main__":
    run_verification()
