# 🐢 Turtle WoW Battleground Bot

A Telegram bot that automatically announces the current Battleground of the Day for Turtle WoW servers.

## Features

- 🕒 Automatic updates every 10 minutes
- 🎮 Commands for checking current BG
- 👥 Works in groups and private chats
- 🔔 Easy subscription/unsubscription system

## Prerequisites

- Node.js 16+ or Bun
- A Telegram Bot Token (get it from [@BotFather](https://t.me/botfather))
- Your Telegram User ID (for initial setup)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/twow-bg-announcer-bot.git
cd twow-bg-announcer-bot
```

2. Install dependencies using your preferred package manager:

Using Bun:
```bash
bun install
```

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

3. Create a `.env` file in the root directory:
```bash
cp .env_example .env
```

4. Edit the `.env` file and add your credentials:
```
TG_BOT_API_TOKEN=your_bot_token_here
```

## Running the Bot

Using Bun:
```bash
bun run start
```

Using npm:
```bash
npm run start
```

Using yarn:
```bash
yarn start
```

## Available Commands

- `/twow` - Start the bot and subscribe to updates
- `/bg` - Get the current Battleground of the Day
- `/twow unsubscribe` - Unsubscribe from updates

## Adding to Groups

1. Add the bot to your group
2. Send `/twow` to start receiving updates
3. The bot will automatically announce new Battlegrounds of the Day

## Development

The bot is built with:
- TypeScript
- grammY (Telegram Bot Framework)
- Puppeteer (for web scraping)
- node-cron (for scheduling)

## License

MIT
