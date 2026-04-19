// ── STEP 3: ANALYTICS ─────────────────────────────────────────────────────
import { callClaude } from "./api.js";
import { S, persistPerformanceHistory } from "./state.js";
import { renderCampaignLogPanel, renderPerformanceHistoryPanel } from "./ui.js";

/**
 * Fetch (simulated) campaign performance data and render metrics + AI summary.
 */
export async function runAnalytics() {
  const perf = {
    creative: { open: 42, click: 18, unsub: 1 },
    ops: { open: 38, click: 12, unsub: 0 },
    founder: { open: 55, click: 24, unsub: 1 },
  };
  S.analytics = perf;

  const avgOpen = Math.round((42 + 38 + 55) / 3);
  const avgClick = Math.round((18 + 12 + 24) / 3);

  const prev = S.performanceHistory[0];
  const openDelta = prev ? avgOpen - prev.avgOpen : null;
  const clickDelta = prev ? avgClick - prev.avgClick : null;
  const unsubTotal = perf.creative.unsub + perf.ops.unsub + perf.founder.unsub;
  const prevUnsub = prev && prev.metrics
    ? prev.metrics.creative.unsub + prev.metrics.ops.unsub + prev.metrics.founder.unsub
    : null;
  const unsubDelta = prevUnsub !== null ? unsubTotal - prevUnsub : null;

  document.getElementById("m-open").textContent = avgOpen + "%";
  document.getElementById("m-open-d").textContent =
    openDelta === null
      ? "First snapshot — next run compares here"
      : (openDelta >= 0 ? "↑ " : "↓ ") + Math.abs(openDelta) + " pts vs previous snapshot";
  document.getElementById("m-click").textContent = avgClick + "%";
  document.getElementById("m-click-d").textContent =
    clickDelta === null
      ? "First snapshot — next run compares here"
      : (clickDelta >= 0 ? "↑ " : "↓ ") + Math.abs(clickDelta) + " pts vs previous snapshot";
  document.getElementById("m-sent").textContent = "12";
  document.getElementById("m-sent-d").textContent = "3 segments · 1 campaign";
  document.getElementById("m-unsub").textContent = String(unsubTotal);
  document.getElementById("m-unsub-d").textContent =
    unsubDelta === null
      ? "First snapshot — next run compares here"
      : (unsubDelta <= 0 ? "↓ " : "↑ ") + Math.abs(unsubDelta) + " vs previous snapshot";

  const colors = { creative: "#7F77DD", ops: "#1D9E75", founder: "#EF9F27" };
  const labels = {
    creative: "Creative professionals",
    ops: "Operations managers",
    founder: "Startup founders",
  };

  document.getElementById("persona-perf").innerHTML = Object.entries(perf)
    .map(
      ([p, d]) => `
      <div class="prow">
        <div class="plabel">${labels[p]}</div>
        <div class="pstat">Open: ${d.open}%</div>
        <div class="bw"><div class="b" style="width:${d.open}%;background:${colors[p]};"></div></div>
        <div class="pstat">Click: ${d.click}%</div>
        <div class="bw"><div class="b" style="width:${Math.min(d.click * 2, 100)}%;background:${colors[p]};opacity:.55;"></div></div>
      </div>`
    )
    .join("");

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    metrics: perf,
    avgOpen,
    avgClick,
    sentCount: 12,
  };
  S.performanceHistory.unshift(snapshot);
  persistPerformanceHistory();
  renderPerformanceHistoryPanel();

  renderCampaignLogPanel();

  const topic = S.topic || "AI in creative automation";
  document.getElementById("ai-sum-wrap").style.display = "block";
  document.getElementById("ai-sum-text").textContent = "Generating AI summary...";

  const summary = await callClaude(
    `Analyze this newsletter campaign for NovaMind. Write exactly 3 sentences in plain prose (no bullets).

Example style (follow the pattern, use our numbers): "Creative Professionals had a 12% higher click rate than Operations. Recommend using more visual case studies next time."

Topic: "${topic}"
- Creative professionals: ${perf.creative.open}% open, ${perf.creative.click}% click, ${perf.creative.unsub} unsub
- Operations managers: ${perf.ops.open}% open, ${perf.ops.click}% click, ${perf.ops.unsub} unsub
- Startup founders: ${perf.founder.open}% open, ${perf.founder.click}% click, ${perf.founder.unsub} unsub

Name the top-performing segment, quantify the gap vs others, and give 2 concrete recommendations for the next campaign.`,
    "You are a concise, data-driven marketing analyst.",
    { max_tokens: 1024 }
  );

  document.getElementById("ai-sum-text").textContent = summary;
}
