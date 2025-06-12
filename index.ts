import dotenv from 'dotenv';
dotenv.config();
import CronJob from 'node-cron';
import puppeteer from 'puppeteer';
import { Bot } from 'grammy';


const scrapeBgName = async () => {
    console.log("Starting scraper...");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

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
    browser.close();
    return bgName;
}

let startingBgName = "..."
console.log(`Starting BG name: ${startingBgName}`);

const bot = new Bot(process.env.TG_BOT_API_TOKEN!);

bot.command('bg', (ctx) => ctx.reply(`🐢 *Turtle WoW Battleground Info* 🐢\n\n⚔️ *Current Battleground of the Day:*\n🏰 ${startingBgName}\n\n_May the Horde/Alliance prevail!_ 🛡️`));

const cronJob = CronJob.schedule('*/15 * * * *', async () => {

    try{
        const bgName = await scrapeBgName();
        if (bgName !== startingBgName) {
            console.log(`the new Battleground of the day is ${bgName}`);
            startingBgName = bgName;
            bot.api.sendMessage(process.env.TG_USER_ID!, `🐢 *Turtle WoW Battleground Update* 🐢\n\n⚔️ *New Battleground of the Day:*\n🏰 ${bgName}\n\n_May the Horde/Alliance prevail!_ 🛡️`);
        }
    } catch (error) {
        console.error("Error scraping BG name: " + error);
    }

});

bot.start();
cronJob.start();

