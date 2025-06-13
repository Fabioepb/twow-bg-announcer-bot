import dotenv from 'dotenv';
dotenv.config();
import CronJob from 'node-cron';
import puppeteer from 'puppeteer';
import { Bot } from 'grammy';

// Store chat IDs where the bot is active
const activeChats = new Set<string>();

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

let startingBgName = ""

try {
    startingBgName = await scrapeBgName();
} catch (error) {
    console.error("Error scraping BG name: " + error);
}


console.log(`Starting BG name: ${startingBgName}`);

const bot = new Bot(process.env.TG_BOT_API_TOKEN!);

// Store chat ID when bot is added to a group
bot.on('message:new_chat_members', async (ctx) => {
    if (ctx.message.new_chat_members.some(member => member.id === ctx.me.id)) {
        activeChats.add(ctx.chat.id.toString());
        await ctx.reply('🐢 Thanks for adding me! I will now send battleground updates to this group. \n\n /twow to start the bot if you haven\'t already. \n\n /bg to get the current BG of the day. \n\n /twow unsubscribe to unsubscribe from the bot.');
    }
});

bot.command("twow", (ctx) => {
    // if the msg includes "unsubscribe" then remove the chat from the activeChats
    if (ctx.msg.text?.includes("unsubscribe")) {
        activeChats.delete(ctx.chat.id.toString());
        ctx.reply("You have been unsubscribed from the Turtle WoW Battleground Bot. \n\n /twow to start the bot if you haven't already. \n\n /bg to get the current BG of the day.");
        return;
    }

    if (!activeChats.has(ctx.chat.id.toString())) {
        ctx.reply("Hello! I am the Turtle WoW Battleground Bot. I will send you updates on the Battleground of the Day. \n\n /bg to get the current BG of the day. \n\n /twow to start the bot if you haven't already. \n\n /twow unsubscribe to unsubscribe from the bot.")
    }
    activeChats.add(ctx.chat.id.toString());
});

// Remove chat ID when bot is removed from a group
bot.on('message:left_chat_member', async (ctx) => {
    if (ctx.message.left_chat_member.id === ctx.me.id) {
        activeChats.delete(ctx.chat.id.toString());
    }
});

bot.command('bg', (ctx) => ctx.reply(`🐢 *Turtle WoW BG Info* 🐢\n\n⚔️ *Current Battleground of the Day:*\n🏰 ${startingBgName}\n\n_May the Horde/Alliance prevail!_ 🛡️`));

const cronJob = CronJob.schedule('*/10 * * * *', async () => {
    try {
        const bgName = await scrapeBgName();
        if (bgName !== startingBgName) {
            console.log(`the new Battleground of the day is ${bgName}`);
            startingBgName = bgName;
            // Send message to all active chats
            for (const chatId of activeChats) {
                try {
                    await bot.api.sendMessage(chatId, `🐢 *Turtle WoW BG Update* 🐢\n\n⚔️ *New Battleground of the Day:*\n🏰 ${bgName}\n\n_May the Horde/Alliance prevail!_ 🛡️\n\n/twow to start the bot if you haven't already. \n\n /bg to get the current BG of the day. \n\n /twow unsubscribe to unsubscribe from the bot.`);
                } catch (error) {
                    console.error(`Failed to send message to chat ${chatId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error scraping BG name: " + error);
    }
});

bot.start();
cronJob.start();

