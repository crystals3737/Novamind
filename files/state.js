// ── APPLICATION STATE ─────────────────────────────────────────────────────
// Central state object. All modules import and mutate this shared object.

export const S = {
  topic:          "",
  blogOutlines:   [], // parallel to blogVersions — outline per version
  blogVersions:   [], // short-form draft body (400–600 words target)
  selectedBlog:   0,
  newsletters:    { creative: [], ops: [], founder: [] },
  selectedNl:     { creative: 0, ops: 0, founder: 0 },
  currentPersona: "creative",
  analytics:      null,
  /** @type {Array<{campaignId:string,blogTitle:string,newsletterIds:Record<string,string>,sendDate:string,segmentsSent:number}>} */
  campaignLog:    [],
  /** @type {Array<{fetchedAt:string,metrics:object,avgOpen:number,avgClick:number}>} */
  performanceHistory: [],
};

const LS_CAMPAIGNS = "novamind_campaign_log";
const LS_PERF      = "novamind_perf_history";

export function loadPersistedState() {
  try {
    const cl = localStorage.getItem(LS_CAMPAIGNS);
    if (cl) S.campaignLog = JSON.parse(cl);
    const ph = localStorage.getItem(LS_PERF);
    if (ph) S.performanceHistory = JSON.parse(ph);
  } catch (_) {
    /* ignore */
  }
}

export function persistCampaignLog() {
  try {
    localStorage.setItem(LS_CAMPAIGNS, JSON.stringify(S.campaignLog.slice(0, 30)));
  } catch (_) {
    /* ignore */
  }
}

export function persistPerformanceHistory() {
  try {
    localStorage.setItem(LS_PERF, JSON.stringify(S.performanceHistory.slice(0, 20)));
  } catch (_) {
    /* ignore */
  }
}
