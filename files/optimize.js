// ── STEP 4: AI-DRIVEN OPTIMIZATION ───────────────────────────────────────
import { callClaude } from "./api.js";
import { S } from "./state.js";
import { getSelTags, goToTab } from "./ui.js";

/**
 * Generate next topic ideas, A/B headline variants, and persona content tips
 * based on the most recent campaign's engagement data.
 */
export async function runOptimize() {
  const btn = document.getElementById("opt-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="sp2"></span>Generating...';
  document.getElementById("opt-status").textContent = "";

  const topic = S.topic || "AI in creative automation";
  const perf  = S.analytics || { creative: { click: 18 }, ops: { click: 12 }, founder: { click: 24 } };

  const raw = await callClaude(
    `You are the content strategist for NovaMind, an AI startup for creative agencies.
A campaign about "${topic}" showed Startup Founders had the highest engagement (${perf.founder?.click || 24}% click rate).

Generate the following — output ONLY the labeled lines, one per line, no explanations:

TOPIC: [blog topic idea 1]
TOPIC: [blog topic idea 2]
TOPIC: [blog topic idea 3]
HEADLINE: [headline variant A]
HEADLINE: [headline variant B]
HEADLINE: [headline variant C]
TIP_CREATIVE: [specific actionable tip for creative professionals content]
TIP_OPS: [specific actionable tip for operations managers content]
TIP_FOUNDER: [specific actionable tip for startup founders content]`,
    "Output only the labeled lines in the exact format specified. Nothing else."
  );

  renderOptResults(raw);
  btn.disabled    = false;
  btn.textContent = "Regenerate recommendations →";
  document.getElementById("opt-status").textContent = "Generated " + new Date().toLocaleTimeString();
}

function renderOptResults(raw) {
  const topics    = [...raw.matchAll(/TOPIC:\s*(.+)/g)].map((m) => m[1].trim());
  const headlines = [...raw.matchAll(/HEADLINE:\s*(.+)/g)].map((m) => m[1].trim());
  const tipC      = (raw.match(/TIP_CREATIVE:\s*(.+)/) || [])[1] || "";
  const tipO      = (raw.match(/TIP_OPS:\s*(.+)/)      || [])[1] || "";
  const tipF      = (raw.match(/TIP_FOUNDER:\s*(.+)/)  || [])[1] || "";

  const safeQ = (s) => s.replace(/'/g, "\\'");

  document.getElementById("opt-topics").innerHTML =
    topics
      .map(
        (t, i) => `
        <div class="oi">
          <span class="on">Idea ${i + 1}</span>
          <span class="ot">${t}</span>
          <button class="btn sm ghost" onclick="useTopic('${safeQ(t)}')">Use as topic →</button>
        </div>`
      )
      .join("") || '<p style="font-size:13px;color:var(--text3);">Try regenerating.</p>';

  document.getElementById("opt-headlines").innerHTML =
    headlines
      .map(
        (h, i) => `
        <div class="oi">
          <span class="on">Variant ${String.fromCharCode(65 + i)}</span>
          <span class="ot">${h}</span>
          <button class="cpbtn" onclick="navigator.clipboard.writeText('${safeQ(h)}')">Copy</button>
        </div>`
      )
      .join("") || '<p style="font-size:13px;color:var(--text3);">Try regenerating.</p>';

  document.getElementById("opt-tips").innerHTML = [
    { label: "Creative professionals", tip: tipC, cls: "chip-c" },
    { label: "Operations managers",    tip: tipO, cls: "chip-o" },
    { label: "Startup founders",       tip: tipF, cls: "chip-f" },
  ]
    .map(
      ({ label, tip, cls }) => `
      <div class="oi" style="flex-direction:column;align-items:flex-start;gap:6px;">
        <span class="chip ${cls}">${label}</span>
        <span class="ot">${tip || "N/A"}</span>
      </div>`
    )
    .join("");

  document.getElementById("opt-results").style.display = "block";
}

/** Use a suggested topic — pre-fills the topic input and switches to Generate tab */
export function useTopic(t) {
  document.getElementById("topic-input").value = t;
  goToTab("generate");
}

/** Refine topic suggestions with revision tags + freeform instruction */
export async function refineOptTopics() {
  const tags = getSelTags("opt-topic-rev-body");
  const note = document.getElementById("opt-topic-rev-note").value.trim();
  if (!tags && !note) { alert("Select a tag or describe what you want."); return; }

  const instr = [tags, note].filter(Boolean).join(". ");
  const el    = document.getElementById("opt-topics");
  el.innerHTML = '<p style="color:var(--text3);font-size:13px;font-style:italic;">Refining topics...</p>';

  const raw    = await callClaude(
    `Generate 3 blog topic ideas for NovaMind (AI startup for creative agencies) with this requirement: ${instr}.\nFormat:\nTOPIC: [idea]\nTOPIC: [idea]\nTOPIC: [idea]`,
    "Output only the 3 labeled TOPIC lines. Nothing else."
  );
  const topics = [...raw.matchAll(/TOPIC:\s*(.+)/g)].map((m) => m[1].trim());

  el.innerHTML = topics
    .map(
      (t, i) => `
      <div class="oi">
        <span class="on">Idea ${i + 1}</span>
        <span class="ot">${t}</span>
        <button class="btn sm ghost" onclick="useTopic('${t.replace(/'/g, "\\'")}')">Use →</button>
      </div>`
    )
    .join("");
}

/** Refine headline variants with revision tags + freeform instruction */
export async function refineOptHeadlines() {
  const tags = getSelTags("opt-hl-rev-body");
  const note = document.getElementById("opt-hl-rev-note").value.trim();
  if (!tags && !note) { alert("Select a tag or describe what you want."); return; }

  const instr     = [tags, note].filter(Boolean).join(". ");
  const el        = document.getElementById("opt-headlines");
  el.innerHTML    = '<p style="color:var(--text3);font-size:13px;font-style:italic;">Refining headlines...</p>';

  const raw       = await callClaude(
    `Generate 3 blog headline variants for a NovaMind post about "${S.topic || "AI automation"}" with this requirement: ${instr}.\nFormat:\nHEADLINE: [variant]\nHEADLINE: [variant]\nHEADLINE: [variant]`,
    "Output only the 3 labeled HEADLINE lines. Nothing else."
  );
  const headlines = [...raw.matchAll(/HEADLINE:\s*(.+)/g)].map((m) => m[1].trim());

  el.innerHTML = headlines
    .map(
      (h, i) => `
      <div class="oi">
        <span class="on">Variant ${String.fromCharCode(65 + i)}</span>
        <span class="ot">${h}</span>
        <button class="cpbtn" onclick="navigator.clipboard.writeText('${h.replace(/'/g, "\\'")}')">Copy</button>
      </div>`
    )
    .join("");
}
