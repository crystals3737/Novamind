// ── STEP 1: GENERATE CONTENT ──────────────────────────────────────────────
import { callClaude, explainApiFailure } from "./api.js";
import { S } from "./state.js";
import { animProg, renderBlogVersions, renderNlVersions, updatePayload } from "./ui.js";

const NL_DESC = {
  creative: "creative professionals (designers, art directors, copywriters at small agencies). Focus on creativity, client work, storytelling. Warm and inspiring.",
  ops:      "operations managers at creative agencies. Focus on efficiency, ROI, workflow, team coordination. Practical and data-driven.",
  founder:  "startup founders and agency owners. Focus on growth, competitive advantage, scaling, strategic vision. Ambitious and entrepreneurial.",
};

const BLOG_STRUCTURE_PROMPT = `Respond using EXACTLY these section markers on their own lines:

---OUTLINE---
[Numbered outline: 4–6 sections planning the blog. No full sentences required in the outline — short phrases are fine.]

---DRAFT---
[The full blog body only: 400–600 words, short paragraphs, plain text. No markdown headers, no bullet lists.]

Rules:
- ---OUTLINE--- and ---DRAFT--- must appear exactly as shown.
- The DRAFT must stand alone as a publishable short blog (400–600 words).
- Tone and topic are given in the user message.`;

/**
 * Split model output into outline + draft. Falls back if markers are missing.
 * @param {string} raw
 * @returns {{ outline: string, draft: string }}
 */
export function parseBlogResponse(raw) {
  const text = (raw || "").trim();
  const m = text.match(/---\s*OUTLINE\s*---([\s\S]*?)---\s*DRAFT\s*---([\s\S]*)/i);
  if (m) {
    return { outline: m[1].trim(), draft: m[2].trim() };
  }
  return {
    outline: "(Outline markers not found — showing model output as draft. Try regenerating.)",
    draft: text,
  };
}

/**
 * Main generation flow: outline + draft per blog version; newsletters per persona.
 */
export async function runGenerate() {
  const topic  = document.getElementById("topic-input").value.trim() || "AI in creative workflow automation";
  const tone   = document.getElementById("tone-select").value;
  const numVer = parseInt(document.getElementById("num-versions").value) || 3;
  S.topic = topic;

  const btn = document.getElementById("gen-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="sp2"></span>Generating...';
  document.getElementById("gen-prog").style.display = "block";
  document.getElementById("blog-section").style.display = "none";
  animProg(0, 20, 1200);

  try {
    animProg(20, 50, 3000);
    const blogRaw = await Promise.all(
      Array.from({ length: numVer }, (_, i) =>
        callClaude(
          `${BLOG_STRUCTURE_PROMPT}

Topic: "${topic}"
Tone: ${tone}
NovaMind helps small creative agencies automate daily workflows — like Notion + Zapier + AI combined.
This is VERSION ${i + 1} of ${numVer}. Use a DISTINCT angle, hook, and structure from other versions.
Start the DRAFT with a punchy headline on the first line, then paragraphs.
Cover: why this matters for creative teams, 2–3 key insights, a CTA to try NovaMind.`,
          undefined,
          { max_tokens: 8192 }
        )
      )
    );
    S.blogOutlines = [];
    S.blogVersions = [];
    for (const raw of blogRaw) {
      const { outline, draft } = parseBlogResponse(raw);
      S.blogOutlines.push(outline);
      S.blogVersions.push(draft);
    }
    S.selectedBlog = 0;

    animProg(50, 80, 3500);
    for (const p of ["creative", "ops", "founder"]) {
      S.newsletters[p] = await Promise.all(
        Array.from({ length: numVer }, (_, i) =>
          callClaude(
            `Write a 120-word newsletter email (VERSION ${i + 1} of ${numVer} — use a DIFFERENT subject line angle and opening each time) for ${NL_DESC[p]}
Promoting a NovaMind blog post about "${topic}".
Format exactly as:
Subject: [subject line here]

[email body here]`,
            undefined,
            { max_tokens: 1024 }
          )
        )
      );
      S.selectedNl[p] = 0;
    }

    animProg(80, 100, 400);
    renderBlogVersions();
    renderNlVersions();
    document.getElementById("blog-section").style.display = "block";
    updatePayload();
    document.getElementById("last-run").textContent = "Generated " + new Date().toLocaleTimeString();
    setTimeout(() => {
      document.getElementById("gen-prog").style.display = "none";
    }, 700);
  } catch (e) {
    S.blogOutlines = [];
    S.blogVersions = [explainApiFailure(e)];
    S.selectedBlog = 0;
    document.getElementById("blog-section").style.display = "block";
    renderBlogVersions();
  }

  btn.disabled = false;
  btn.textContent = "Regenerate →";
}

/**
 * Regenerate only blog versions (keeping newsletters).
 */
export async function regenBlog() {
  const btn    = document.getElementById("regen-blog-btn");
  const numVer = parseInt(document.getElementById("num-versions").value) || 3;
  const tone   = document.getElementById("tone-select").value;
  btn.disabled = true;
  btn.innerHTML = '<span class="sp2" style="border-top-color:var(--text2)"></span>Regenerating...';

  try {
    const blogRaw = await Promise.all(
      Array.from({ length: numVer }, (_, i) =>
        callClaude(
          `${BLOG_STRUCTURE_PROMPT}

Topic: "${S.topic}"
Tone: ${tone}
VERSION ${i + 1} of ${numVer} — fresh angle, distinct hook.`,
          undefined,
          { max_tokens: 8192 }
        )
      )
    );
    S.blogOutlines = [];
    S.blogVersions = [];
    for (const raw of blogRaw) {
      const { outline, draft } = parseBlogResponse(raw);
      S.blogOutlines.push(outline);
      S.blogVersions.push(draft);
    }
    S.selectedBlog = 0;
    renderBlogVersions();
    updatePayload();
  } catch (e) {
    alert(explainApiFailure(e));
  }

  btn.disabled = false;
  btn.textContent = "Regenerate blog versions";
}
