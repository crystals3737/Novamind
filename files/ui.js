// ── UI UTILITIES ──────────────────────────────────────────────────────────
import { S } from "./state.js";
import { CONTACTS } from "./contacts.js";

// ── Tabs ──────────────────────────────────────────────────────────────────
export function goToTab(name) {
  document.querySelectorAll(".tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === name)
  );
  document.querySelectorAll(".panel").forEach((p) =>
    p.classList.toggle("active", p.id === `panel-${name}`)
  );
}

export function initTabs() {
  document.querySelectorAll(".tabs .tab").forEach((t) => {
    t.onclick = () => goToTab(t.dataset.tab);
  });
}

// ── Progress bar ──────────────────────────────────────────────────────────
export function animProg(from, to, dur) {
  const bar = document.getElementById("gen-prog-b");
  const t0  = Date.now();
  const tick = () => {
    const p = Math.min(1, (Date.now() - t0) / dur);
    bar.style.width = from + (to - from) * p + "%";
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Clipboard ─────────────────────────────────────────────────────────────
export function copyEl(id) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).catch(() => {});
}

// ── Revision panels ───────────────────────────────────────────────────────
export function toggleRev(bodyId, arrowId) {
  const open = document.getElementById(bodyId).classList.toggle("open");
  document.getElementById(arrowId).textContent = open ? "▾" : "▸";
}

export function toggleTag(btn) {
  btn.classList.toggle("sel");
}

export function getSelTags(containerId) {
  return [...document.querySelectorAll(`#${containerId} .rev-tag.sel`)]
    .map((b) => b.textContent)
    .join(", ");
}

// ── Contacts ──────────────────────────────────────────────────────────────
export function renderContacts() {
  Object.keys(CONTACTS).forEach((p) => {
    document.getElementById(`contacts-${p}`).innerHTML = CONTACTS[p]
      .map(
        (c) => `
        <div class="crow">
          <div class="av" style="background:${c.bg};color:${c.tc};">${c.init}</div>
          <div class="cn"><strong>${c.name}</strong><span>${c.co}</span></div>
          <span class="sp sp-q">Queued</span>
        </div>`
      )
      .join("");
  });
}

// ── HubSpot-style payload preview (realistic endpoints + batch shapes) ─────
function newsletterIdFor(personaKey) {
  const base = { creative: "nm-nl-creative", ops: "nm-nl-ops", founder: "nm-nl-founder" };
  const v = (S.selectedNl[personaKey] ?? 0) + 1;
  return `${base[personaKey]}-v${v}`;
}

function blogTitleFromState() {
  const draft = S.blogVersions[S.selectedBlog] || "";
  const first = draft.split("\n").map((l) => l.trim()).find(Boolean) || "";
  const t = first.replace(/^#+\s*/, "").slice(0, 120);
  return t || S.topic || "NovaMind weekly blog";
}

export function updatePayload() {
  const topic = S.topic || document.getElementById("topic-input")?.value?.trim() || "AI in creative workflow automation";
  const blogTitle = blogTitleFromState();

  document.getElementById("hubspot-payload").textContent = JSON.stringify(
    {
      description: "Mock HubSpot-style payloads for demo — no live HTTP calls.",
      contacts_batch_upsert: {
        method: "POST",
        path:   "/crm/v3/objects/contacts/batch/upsert",
        idProperty: "email",
        inputs: [
          { id: "creative-1", properties: { email: "maya@prism.studio", firstname: "Maya", lastname: "Chen", company: "Prism Studio", persona_segment: "creative_professionals" } },
          { id: "ops-1", properties: { email: "jordan@sableops.example", firstname: "Jordan", lastname: "Price", company: "Sable Ops", persona_segment: "operations_managers" } },
          { id: "founder-1", properties: { email: "alex@seedling.example", firstname: "Alex", lastname: "Voss", company: "Seedling AI", persona_segment: "startup_founders" } },
        ],
      },
      marketing_email_send: {
        method: "POST",
        path:   "/marketing/v3/emails/{emailId}/send",
        emailId: "mock-email-object-id",
        blogTitle,
        topic,
        segments: [
          {
            persona: "creative_professionals",
            newsletterId: newsletterIdFor("creative"),
            templateId: "nm-creative-001",
            contactCount: 4,
            tags: ["creative", "agency", "design"],
          },
          {
            persona: "operations_managers",
            newsletterId: newsletterIdFor("ops"),
            templateId: "nm-ops-001",
            contactCount: 4,
            tags: ["operations", "workflow", "efficiency"],
          },
          {
            persona: "startup_founders",
            newsletterId: newsletterIdFor("founder"),
            templateId: "nm-founder-001",
            contactCount: 4,
            tags: ["founder", "startup", "growth"],
          },
        ],
      },
      campaign: `NovaMind Weekly — ${topic}`,
      fromName: "NovaMind Team",
      fromEmail: "hello@novamind.ai",
      scheduledAt: new Date().toISOString(),
      trackOpens: true,
      trackClicks: true,
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: topic.toLowerCase().replace(/\s+/g, "-"),
    },
    null,
    2
  );
}

// ── Version selectors ─────────────────────────────────────────────────────
export function renderBlogVersions() {
  document.getElementById("blog-ver-strip").innerHTML =
    S.blogVersions
      .map(
        (_, i) =>
          `<button class="ver-btn ${i === S.selectedBlog ? "active" : ""}" onclick="selectBlogVer(${i})">Version ${i + 1}</button>`
      )
      .join("") +
    `<span class="ver-label">${S.blogVersions.length} version${S.blogVersions.length !== 1 ? "s" : ""} — pick the one to send</span>`;
  showBlogVer(S.selectedBlog);
}

export function selectBlogVer(i) {
  S.selectedBlog = i;
  document.querySelectorAll("#blog-ver-strip .ver-btn").forEach((b, j) =>
    b.classList.toggle("active", j === i)
  );
  showBlogVer(i);
  updatePayload();
}

function wordCount(s) {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}

export function showBlogVer(i) {
  const txt = S.blogVersions[i] || "";
  const outline = S.blogOutlines[i];
  const ow = document.getElementById("blog-outline-wrap");
  const op = document.getElementById("blog-outline");
  if (outline && ow && op) {
    ow.style.display = "block";
    op.textContent = outline;
  } else if (ow) {
    ow.style.display = "none";
  }
  document.getElementById("blog-display").textContent = txt;
  const wc = wordCount(txt);
  const el = document.getElementById("blog-wc");
  if (!txt) {
    el.textContent = "";
    el.className = "";
    return;
  }
  let hint = `≈${wc} words`;
  let cls = "";
  if (wc >= 400 && wc <= 600) {
    hint += " · within 400–600 target";
    cls = "wc-ok";
  } else if (wc < 400) {
    hint += " · below 400 — consider expanding";
    cls = "wc-warn";
  } else {
    hint += " · above 600 — consider trimming";
    cls = "wc-warn";
  }
  el.textContent = hint;
  el.className = cls;
}

function buildStructuredExportObject() {
  const tone = document.getElementById("tone-select")?.value || "";
  return {
    formatVersion: 1,
    topic: S.topic,
    tone,
    generatedAt: new Date().toISOString(),
    storage: "JSON export (structured content bundle)",
    blogVersions: S.blogVersions.map((draft, i) => ({
      version: i + 1,
      outline: S.blogOutlines[i] || "",
      draftWordCount: wordCount(draft),
      draft,
    })),
    newsletters: {
      creative: S.newsletters.creative || [],
      ops: S.newsletters.ops || [],
      founder: S.newsletters.founder || [],
    },
    selected: {
      blogVersionIndex: S.selectedBlog,
      newsletterVersionByPersona: { ...S.selectedNl },
    },
    campaignLog: S.campaignLog,
    performanceHistory: S.performanceHistory,
  };
}

function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportStructuredJSON() {
  downloadText(
    `novamind-content-${Date.now()}.json`,
    JSON.stringify(buildStructuredExportObject(), null, 2),
    "application/json"
  );
}

export function exportStructuredMarkdown() {
  const o = buildStructuredExportObject();
  const lines = [
    `# NovaMind content export`,
    ``,
    `- Topic: ${o.topic}`,
    `- Tone: ${o.tone}`,
    `- Exported: ${o.generatedAt}`,
    ``,
    `## Blog versions`,
    ...o.blogVersions.map(
      (b) =>
        `### Version ${b.version}\n\n#### Outline\n\n${b.outline}\n\n#### Draft (${b.draftWordCount} words)\n\n${b.draft}\n`
    ),
    `## Newsletters`,
    `### Creative`,
    ...(o.newsletters.creative || []).map((x, i) => `#### v${i + 1}\n\n${x}\n`),
    `### Operations`,
    ...(o.newsletters.ops || []).map((x, i) => `#### v${i + 1}\n\n${x}\n`),
    `### Founders`,
    ...(o.newsletters.founder || []).map((x, i) => `#### v${i + 1}\n\n${x}\n`),
  ];
  downloadText(`novamind-content-${Date.now()}.md`, lines.join("\n"), "text/markdown");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Refresh campaign log panel from persisted `S.campaignLog`. */
export function renderCampaignLogPanel() {
  const el = document.getElementById("campaign-log");
  if (!el) return;
  if (!S.campaignLog.length) {
    el.innerHTML =
      '<p style="font-size:13px;color:var(--text3);">No campaigns logged yet. Send a campaign in tab 2 first.</p>';
    return;
  }
  el.innerHTML = S.campaignLog.map(
    (entry) => `
    <div class="lrow">
      <div class="lt">${escapeHtml(entry.blogTitle)}</div>
      <div class="lm">${new Date(entry.sendDate).toLocaleString()} · ${entry.segmentsSent} sends
        <div style="font-size:11px;opacity:.88;margin-top:4px;line-height:1.4;">
          Newsletter IDs — creative: <code>${escapeHtml(entry.newsletterIds.creative)}</code><br/>
          ops: <code>${escapeHtml(entry.newsletterIds.ops)}</code><br/>
          founder: <code>${escapeHtml(entry.newsletterIds.founder)}</code>
        </div>
      </div>
      <span class="sp sp-s">Logged</span>
    </div>`
  ).join("");
}

/** Refresh performance history panel from `S.performanceHistory`. */
export function renderPerformanceHistoryPanel() {
  const el = document.getElementById("perf-history");
  if (!el) return;
  if (!S.performanceHistory.length) {
    el.innerHTML =
      '<p style="font-size:13px;color:var(--text3);">Run analytics to record snapshots.</p>';
    return;
  }
  el.innerHTML = S.performanceHistory.slice(0, 8).map(
    (h) => `
    <div class="lrow" style="opacity:.96">
      <div class="lt">${new Date(h.fetchedAt).toLocaleString()}</div>
      <div class="lm">Avg open ${h.avgOpen}% · avg click ${h.avgClick}% · ${h.sentCount || 12} sent (simulated)</div>
    </div>`
  ).join("");
}

export function renderNlVersions() {
  const p       = S.currentPersona;
  const versions = S.newsletters[p] || [];
  const sel      = S.selectedNl[p] || 0;
  document.getElementById("nl-ver-strip").innerHTML =
    versions
      .map(
        (_, i) =>
          `<button class="ver-btn ${i === sel ? "active" : ""}" onclick="selectNlVer(${i})">Version ${i + 1}</button>`
      )
      .join("") +
    (versions.length
      ? `<span class="ver-label">${versions.length} version${versions.length !== 1 ? "s" : ""}</span>`
      : "");
  showNlVer(sel);
}

export function selectNlVer(i) {
  S.selectedNl[S.currentPersona] = i;
  document.querySelectorAll("#nl-ver-strip .ver-btn").forEach((b, j) =>
    b.classList.toggle("active", j === i)
  );
  showNlVer(i);
  updatePayload();
}

export function showNlVer(i) {
  const txt = (S.newsletters[S.currentPersona] || [])[i] || "Generate content first.";
  document.getElementById("nl-display").textContent = txt;
  const L = {
    creative: "Creative professionals — designers & art directors",
    ops:      "Operations managers — workflow & efficiency focus",
    founder:  "Startup founders — growth & strategic lens",
  };
  document.getElementById("nl-persona-label").textContent = L[S.currentPersona] || "";
}

export function switchPersona(p, btn) {
  document.querySelectorAll(".ptab").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  S.currentPersona = p;
  renderNlVersions();
  updatePayload();
}
