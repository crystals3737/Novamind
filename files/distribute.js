// ── STEP 2: CRM + DISTRIBUTE ──────────────────────────────────────────────
import { CONTACTS } from "./contacts.js";
import { S, persistCampaignLog } from "./state.js";
import { updatePayload } from "./ui.js";

function blogTitleFromState() {
  const draft = S.blogVersions[S.selectedBlog] || "";
  const first = draft.split("\n").map((l) => l.trim()).find(Boolean) || "";
  const t = first.replace(/^#+\s*/, "").slice(0, 120);
  return t || S.topic || "NovaMind weekly blog";
}

/**
 * Simulate sending the campaign to all contacts.
 * Logs campaign to in-memory state + localStorage (blog title, newsletter IDs, send date).
 */
export async function runSend() {
  const btn = document.getElementById("send-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="sp2"></span>Sending...';

  await new Promise((r) => setTimeout(r, 1800));

  Object.keys(CONTACTS).forEach((p) => {
    document.querySelectorAll(`#contacts-${p} .sp`).forEach((el, i) => {
      setTimeout(() => {
        el.className = "sp sp-s";
        el.textContent = "Sent";
      }, i * 200);
    });
  });

  const sendDate = new Date().toISOString();
  const campaignId = `cmp_${Date.now()}`;
  const blogTitle = blogTitleFromState();
  const newsletterIds = {
    creative: `nm-nl-creative-v${(S.selectedNl.creative ?? 0) + 1}-${campaignId.slice(-8)}`,
    ops: `nm-nl-ops-v${(S.selectedNl.ops ?? 0) + 1}-${campaignId.slice(-8)}`,
    founder: `nm-nl-founder-v${(S.selectedNl.founder ?? 0) + 1}-${campaignId.slice(-8)}`,
  };

  S.campaignLog.unshift({
    campaignId,
    blogTitle,
    newsletterIds,
    sendDate,
    segmentsSent: 12,
  });
  persistCampaignLog();

  updatePayload();

  btn.disabled = false;
  btn.textContent = "Resend campaign →";
  document.getElementById("send-status").textContent =
    "12 emails delivered · logged to CRM · " + new Date().toLocaleTimeString();
}
