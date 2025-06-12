
import puppeteer from 'puppeteer';

console.log("Starting...");
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({width: 1080, height: 1024});

// Set localStorage before navigation
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('turtle-timer-settings', `{"state":{"displaySettings":false,"settings":{"condensedTimers":false,"raid40":false,"ony":false,"kara":false,"raid20":false,"eom":false,"pvp":true,"dmf":false}},"version":2}`);
});

console.log("Navigating to the page...");
await page.goto("https://turtle-timer.vercel.app/");

console.log("Waiting for the text to be visible...");
const textSelector = await page.locator('h3').filter((el) => el.textContent?.includes("BG of the day") ?? false).waitHandle();

const bgName = await textSelector.evaluate((el) => {
    const parent = el.parentElement;
    const h2Element = parent?.querySelector('h2');
    return h2Element?.textContent ?? 'Not found';
});

