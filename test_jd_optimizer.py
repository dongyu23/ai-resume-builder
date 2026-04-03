from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://127.0.0.1:3001')
    page.on("response", lambda response: print("<<", response.status, response.url))
    page.wait_for_load_state('networkidle')
    
    print("Page loaded.")
    
    # Click Optimize JD
    page.locator('button', has_text="Optimize JD").click()
    page.wait_for_selector('textarea')
    
    print("JD Modal opened.")
    
    # Fill the textarea
    page.get_by_placeholder("Paste the job requirements here...").fill("We need a senior frontend engineer with React and Node.js skills.")
    
    # Click Align with JD
    page.locator('button', has_text="Align with JD").click()
    
    print("Waiting for optimization result...")
    try:
        # Wait for the Apply & Rebuild button. Real AI takes longer (up to 120s)
        page.wait_for_selector('button:has-text("Apply & Rebuild")', timeout=120000)
    except Exception as e:
        print("Timeout waiting for Apply & Rebuild. Page content:")
        print(page.locator('.text-red-400').inner_text() if page.locator('.text-red-400').count() > 0 else "No error message.")
        raise e
    
    print("Optimization finished, clicking apply...")
    # Click Apply & Rebuild
    page.locator('button:has-text("Apply & Rebuild")').click()
    
    # Wait for the compilation to start
    time.sleep(2)
    
    print("Checking active file...")
    # Check if the active file is main_tailored
    active_files = page.locator('.bg-\\[var\\(--color-bg-hover\\)\\]').all_inner_texts()
    print("Active file:", active_files)
    
    browser.close()