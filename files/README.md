# NovaMind — AI Content Pipeline

A Claude-powered marketing content pipeline that automates blog post generation, persona-targeted newsletter creation, CRM distribution, and AI-driven performance optimization.

![NovaMind Pipeline](https://img.shields.io/badge/Powered%20by-Claude%20AI-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Content Generation** — Generate multiple blog post versions with different angles and tones in parallel
- **Persona Newsletters** — Auto-create tailored newsletter emails for 3 audience segments (Creative Professionals, Operations Managers, Startup Founders)
- **AI Revisions** — Request targeted revisions via quick-tags or freeform instructions, with accept/discard workflow
- **CRM Distribution** — Preview HubSpot API payloads and simulate sending campaigns to segmented contacts
- **Analytics** — View campaign performance metrics per persona with visual bar charts
- **AI Optimization** — Claude analyzes engagement data and recommends next blog topics, A/B headline variants, and persona-specific content tips

## Project Structure

```
files/
├── index.html          # Main app entry (ES modules)
├── styles.css
├── config.js           # API key + model config
├── contacts.js         # CRM contact data
├── state.js            # App state + localStorage (campaign log, perf history)
├── api.js              # Anthropic API client
├── ui.js               # UI, HubSpot payload, JSON/Markdown export
├── generate.js         # Outline + blog draft (400–600w) + newsletters
├── revisions.js        # Revision workflow
├── distribute.js       # Send simulation + campaign logging
├── analytics.js        # Metrics + AI summary + snapshots
└── optimize.js         # Bonus: topic/headline recommendations
```

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/your-username/novamind.git
cd novamind
```

### 2. Add your Anthropic API key

Open `config.js` (next to `index.html`) and replace the placeholder:

```js
export const API_KEY = "sk-ant-your-key-here";
```

> ⚠️ **Security notice:** This demo calls the Anthropic API directly from the browser for simplicity. In production, route all API calls through your own backend server to protect your API key.

### 3. Open the app

```bash
open index.html
# or serve with any static file server:
npx serve .
```

## Usage

1. **Generate** — Enter a blog topic, choose a tone, pick how many versions to generate, then hit Generate
2. **Select versions** — Compare blog and newsletter versions per persona, request revisions as needed
3. **Distribute** — Review the HubSpot payload preview and send the campaign
4. **Analytics** — Fetch simulated performance data and get an AI executive summary
5. **Optimize** — Generate AI recommendations for next topics, headlines, and persona strategies

## Configuration

| Variable | File | Description |
|----------|------|-------------|
| `API_KEY` | `config.js` | Your Anthropic API key |
| `MODEL` | `config.js` | Claude model to use (default: `claude-sonnet-4-20250514`) |
| `CONTACTS` | `contacts.js` | CRM contact list per persona segment |

## Tech Stack

- Vanilla HTML/CSS/JS (zero dependencies, zero build step)
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages)
- Claude Sonnet for all AI generation tasks

## License

MIT
