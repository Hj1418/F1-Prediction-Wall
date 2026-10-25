import os
import time
from playwright.sync_api import sync_playwright

def capture_ui_screenshots():
    out_dir = os.path.abspath("generated_screenshots")
    os.makedirs(out_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")

        # 1. Desktop Screenshots (1920x1080, device_scale_factor=2)
        print("Capturing Desktop Screenshots...")
        desktop_page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        
        # Desktop Home
        print("  Navigating to Desktop Home...")
        desktop_page.goto("http://localhost:4173/#/")
        time.sleep(2)
        desktop_page.screenshot(path=os.path.join(out_dir, "desktop_home.png"))
        print("  -> Saved desktop_home.png")

        # Desktop Predictions Hub
        print("  Navigating to Predictions Hub...")
        desktop_page.goto("http://localhost:4173/#/predictions")
        time.sleep(2)
        desktop_page.screenshot(path=os.path.join(out_dir, "desktop_predictions.png"))
        print("  -> Saved desktop_predictions.png")

        # Desktop Leaderboard
        print("  Navigating to Leaderboard...")
        desktop_page.goto("http://localhost:4173/#/leaderboard")
        time.sleep(2)
        desktop_page.screenshot(path=os.path.join(out_dir, "desktop_leaderboard.png"))
        print("  -> Saved desktop_leaderboard.png")

        # Desktop Calendar
        print("  Navigating to Calendar...")
        desktop_page.goto("http://localhost:4173/#/calendar")
        time.sleep(2)
        desktop_page.screenshot(path=os.path.join(out_dir, "desktop_calendar.png"))
        print("  -> Saved desktop_calendar.png")

        desktop_page.close()

        # 2. Mobile Screenshots (390x844, iPhone style, device_scale_factor=2)
        print("Capturing Mobile Screenshots...")
        mobile_page = browser.new_page(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
        )

        # Mobile Home
        print("  Navigating to Mobile Home...")
        mobile_page.goto("http://localhost:4173/#/")
        time.sleep(2)
        mobile_page.screenshot(path=os.path.join(out_dir, "mobile_home.png"))
        print("  -> Saved mobile_home.png")

        # Mobile Predictions
        print("  Navigating to Mobile Predictions...")
        mobile_page.goto("http://localhost:4173/#/predictions")
        time.sleep(2)
        mobile_page.screenshot(path=os.path.join(out_dir, "mobile_predictions.png"))
        print("  -> Saved mobile_predictions.png")

        # Mobile Leaderboard
        print("  Navigating to Mobile Leaderboard...")
        mobile_page.goto("http://localhost:4173/#/leaderboard")
        time.sleep(2)
        mobile_page.screenshot(path=os.path.join(out_dir, "mobile_leaderboard.png"))
        print("  -> Saved mobile_leaderboard.png")

        mobile_page.close()
        browser.close()

    print("All UI screenshots captured successfully!")

if __name__ == "__main__":
    capture_ui_screenshots()
