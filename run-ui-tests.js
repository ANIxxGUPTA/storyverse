const puppeteer = require('puppeteer');

async function run() {
  console.log("Starting UI E2E test via Puppeteer...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    console.error(`Browser Uncaught Exception: ${err.message}`);
  });

  try {
    const timestamp = Date.now();
    const email = `test${timestamp}@test.com`;

    // 1. Signup
    console.log("Navigating to Signup...");
    await page.goto('http://localhost:5174/signup');
    await page.waitForSelector('input[type="text"]');
    
    await page.type('input[type="text"]', `user${timestamp}`);
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Wait for redirect to Dashboard
    console.log("Waiting for Dashboard redirect...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    if (page.url() !== 'http://localhost:5174/dashboard') {
      throw new Error(`Failed to redirect to dashboard. Current URL: ${page.url()}`);
    }
    console.log("Successfully logged in and reached Dashboard!");

    // 3. Create Story
    console.log("Creating a story...");
    await page.waitForSelector('input[placeholder="e.g. The Legend of the Lost Realm"]');
    await page.type('input[placeholder="e.g. The Legend of the Lost Realm"]', 'My Puppeteer Story');
    await page.type('textarea[placeholder="Summarize your story here..."]', 'This is a test story created by Puppeteer.');
    
    // Find and click the "Create Story" button
    const buttons = await page.$$('button');
    let createBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes("Create Story")) {
        createBtn = btn;
        break;
      }
    }
    
    if (!createBtn) throw new Error("Could not find 'Create Story' button");
    await createBtn.click();
    
    // Wait for the story to appear in "My Stories"
    console.log("Waiting for story to appear in list...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes('My Puppeteer Story')) {
       console.error("Story creation failed! Taking screenshot...");
       await page.screenshot({ path: 'error_screenshot.png' });
       throw new Error("Story did not appear in dashboard!");
    }
    console.log("Story created successfully in UI!");

    console.log("\n🚀 All UI tests passed!");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

run();
