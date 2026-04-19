# Novamind
# NovaMind — AI Content Pipeline

This is a very simple AI marketing pipeline that turns a blog idea into  content, personalized newsletters, and performance insights.

Built as a take-home assignment for NovaMind, a fictional early-stage AI startup that helps small creative agencies automate their daily workflows.

---

## Demo

Open `files/index.html` in any browser (or serve the `files/` folder). No build step and no npm install. Configure your API key in `files/config.js`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       index.html  (Single-file app)                      │
│                                                                          │
│  Tab 1: Generate                Tab 2: CRM           Tab 3: Analytics   │
│  ┌──────────────────────┐       ┌──────────────┐     ┌───────────────┐  │
│  │ Topic + Tone + #Vers │       │ 12 contacts  │     │ Open/Click/   │  │
│  │ ──────────────────── │       │ 3 personas   │     │ Unsub rates   │  │
│  │ Outline + 400–600w   │──────▶│ HubSpot JSON │────▶│ Persona bars  │  │
│  │ N blog + NL versions │       │ Send sim     │     │ Campaign log  │  │
│  │ JSON / MD export     │       │ + batch upsert│    │ + history     │  │
│  │ ──────────────────── │       └──────────────┘     │ AI summary    │  │
│  │ Revision panel       │                             └───────────────┘  │
│  │  - Quick tags        │                                                │
│  │  - Custom note       │       Tab 4: Optimize (Bonus)                  │
│  │  - Accept/Discard    │       ┌──────────────────────────────────────┐ │
│  └──────────────────────┘       │ Next topic ideas + refine panel      │ │
│                                 │ Headline A/B variants + refine panel │ │
│                                 │ Persona-specific content tips        │ │
│                                 └──────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Anthropic Claude API                              │  │
│  │        claude-sonnet-4-20250514 via /v1/messages                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline flow

1. **Topic input** → User enters a topic, tone, and how many versions to generate (1–3)
2. **AI generates outline + blog** → For each version, Claude returns a structured outline plus a short-form draft (400–600 words target), parsed from `---OUTLINE---` / `---DRAFT---` markers
3. **3 persona newsletters** → For each of 3 personas, Claude writes N distinct newsletter versions in parallel
4. **Version selection** → User compares all versions side by side and picks one per content type
5. **Revision workflow** → User can request revisions using quick tags, a custom text prompt, or both — then preview, accept, or discard the revised version
6. **CRM distribution** → Contacts are pre-tagged by persona; a HubSpot-compatible JSON payload is displayed; campaign "sends" with animated delivery status
7. **Performance analytics** → Simulated engagement metrics with persona breakdown bars; Claude generates an AI-powered executive summary
8. **Optimization** → Claude suggests next blog topics, headline A/B variants, and persona tips based on engagement data — all refinable through their own revision panels

---

## Tools, APIs & Models

| Component | Tool / Service |
|-----------|---------------|
| AI model | Claude Sonnet 4 (`claude-sonnet-4-20250514`) via Anthropic API |
| Frontend | Vanilla HTML/CSS/JS — no framework, no build step |
| CRM integration | HubSpot API (mocked — realistic endpoint + payload format) |
| Email delivery | Simulated with animated status updates per contact |
| Performance data | Simulated (representative open/click/unsubscribe rates by persona) |
| Storage | In-memory state + **JSON/Markdown export**; **localStorage** for campaign log & performance snapshots |

---

## Target Personas

Three audience segments, each receiving distinct newsletter copy:

**Creative Professionals** — designers, art directors, and copywriters at small agencies. Content focuses on creativity, client work, visual storytelling, and standing out. Warm, inspiring tone.

**Operations Managers** — team leads and workflow coordinators at creative agencies. Content focuses on efficiency, ROI, reducing process friction, and team coordination. Practical, metrics-driven tone.

**Startup Founders** — agency owners and early-stage founders. Content focuses on growth, competitive advantage, scaling, and strategic vision. Ambitious, entrepreneurial tone.

---

## Feature Coverage

### Core requirements

| Requirement | Implementation |
|-------------|---------------|
| AI content generation (blog + 3 newsletters) | Tab 1 — calls Claude in parallel for all content |
| Structured content storage | In-memory state (`S.blogOutlines`, `S.blogVersions`, `S.newsletters`) + download as **JSON or Markdown** |
| CRM contact creation + tagging | Tab 2 — mock contacts pre-segmented by persona |
| Newsletter send per persona segment | Tab 2 — simulated send with HubSpot-format payload |
| Campaign logging | Tab 2 send → log **blog title**, **newsletter IDs** per persona, **send date** (persisted in localStorage); Tab 3 displays the log |
| Performance data fetch + storage | Tab 3 — simulated open/click/unsub; **historical snapshots** stored for comparison |
| AI-powered performance summary | Tab 3 — Claude analyzes metrics and gives recommendations |

### Bonus features

| Bonus requirement | Implementation |
|-------------------|---------------|
| AI-driven content optimization (next topics, headlines based on engagement) | Tab 4 — Claude suggests 3 topic ideas + 3 headline A/B variants based on click rate data |
| Multiple copy options with ability to add revisions and suggestions | Tab 1 — generate 1–3 blog versions + 1–3 newsletter versions per persona; each has a revision panel with quick tags, custom notes, accept/discard flow |
| Simple dashboard / web UI to view and trigger the workflow | The entire app — tabbed dashboard with pipeline flow diagram, version selectors, revision panels, contact tables, metric cards, and performance bars |

---

## Assumptions & Mocked Data

- **HubSpot API calls are simulated.** The JSON payload mirrors real HubSpot `/crm/v3/objects/contacts` and `/marketing/v3/emails/{id}/send` endpoint structure, but no actual HTTP requests go to HubSpot. In production you'd authenticate with a HubSpot access token and hit live endpoints.
- **Contact data is hardcoded mock data.** 12 fictional contacts across 3 persona segments.
- **Performance metrics are simulated.** Open rates, click rates, and unsubscribe counts are representative values used to demonstrate the analytics and AI summary features. In production these would be fetched from HubSpot's `/marketing/v3/emails/{id}/statistics` endpoint after a real send.
- **All AI calls are real.** Blog posts, newsletter copy, performance summaries, revision outputs, and optimization recommendations are all generated live by Claude.
- **API key is client-side for demo purposes only.** In production, API calls should be proxied through a backend to protect the key.

---

## How to Run Locally

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An [Anthropic API key](https://console.anthropic.com/)

### Steps

1. **Clone or download this repo**
   ```bash
   git clone https://github.com/yourusername/novamind-pipeline.git
   cd novamind-pipeline
   ```

2. **Add your API key**

   Edit `files/config.js`:
   ```javascript
   export const API_KEY = "YOUR_ANTHROPIC_API_KEY";
   ```
   Replace with your key from [console.anthropic.com](https://console.anthropic.com/).

3. **Open in browser**

   ```bash
   cd files
   open index.html          # macOS
   ```

   ES modules require a local server (or you may see CORS / module errors):
   ```bash
   cd files && python3 -m http.server 8765
   # Open http://localhost:8765/
   ```

4. **Use the pipeline**

   - **Tab 1** — Enter a topic, pick a tone, choose how many versions to generate, click "Generate"
   - Review **outline** and **draft** per blog version; word count highlights the 400–600 word target
   - **Export JSON** or **Export Markdown** to save structured content
   - Compare blog versions using the version buttons; select your preferred one
   - Switch persona tabs (Creative / Ops / Founder) to compare newsletter versions
   - Use the revision panel on any piece of content to apply quick tags or custom revision instructions
   - **Tab 2** — Review the HubSpot payload, then click "Send campaign"
   - **Tab 3** — Click "Fetch & analyze performance" to see metrics + AI summary
   - **Tab 4** — Click "Generate recommendations" to get next topic ideas, headline variants, and persona tips — each refinable with their own revision panel

---

## Repository Structure

```
novamind-ai-content-pipeline-main/
├── README.md
└── files/
    ├── index.html    # App shell + tabbed UI
    ├── styles.css
    ├── config.js     # API key + model id
    ├── state.js      # Shared state + localStorage helpers
    ├── api.js        # Anthropic client
    ├── generate.js   # Outline + blog draft + newsletters
    ├── ui.js         # HubSpot payload preview, export, rendering
    ├── distribute.js # Send simulation + CRM campaign log
    ├── analytics.js  # Metrics + AI summary + perf history
    ├── optimize.js   # Bonus optimization tab
    └── …
```

---

## AI Prompting Strategy

Each stage uses a distinct prompting approach:

**Blog generation** — Each version is "VERSION N of M" with a distinct angle. The model must emit `---OUTLINE---` then `---DRAFT---`; the app parses these and renders outline + 400–600 word draft separately.

**Newsletter variants** — Separate system context per persona (creative / ops / founder) emphasizes different value propositions and tones. Each version is also told to use a "DIFFERENT subject line angle and opening."

**Revision workflow** — The model receives the full current text plus a composed instruction string (from quick tags + custom note). It is instructed to return only the revised content with no preamble.

**Performance summary** — Structured metric data is injected as a numbered list. The model is told to name a winner, explain why it won, and give exactly 2 concrete recommendations.

**Optimization output** — Uses a strict labeled format (`TOPIC:`, `HEADLINE:`, `TIP_CREATIVE:`, etc.) parsed with regex. Keeps the output machine-readable while remaining human-editable via the refine panels.

---

## Potential Production Extensions

- **Real HubSpot integration** — swap simulated sends for live API calls with OAuth token
- **Backend proxy** — move Anthropic calls to a Node/Python server to protect the API key
- **Database** — persist generated content, campaign logs, and performance history (e.g. Supabase, Firebase)
- **Scheduled sends** — cron job or HubSpot workflows for weekly automated content generation
- **A/B testing** — randomly split persona segments across headline variants and measure lift
- **Webhook listener** — receive real-time HubSpot engagement events to update performance data
- **Export** — app already supports JSON/Markdown download; optional CMS push in production

---

*Built with Claude Sonnet 4 · Anthropic API · Vanilla JS · No dependencies*
