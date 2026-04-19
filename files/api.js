// ── ANTHROPIC API CLIENT ──────────────────────────────────────────────────
import { API_KEY, MODEL } from "./config.js";

const KEY = typeof API_KEY === "string" ? API_KEY.trim() : "";

const DEFAULT_SYSTEM =
  "You are a marketing content expert for NovaMind, an AI startup that helps creative agencies " +
  "automate their workflows. Use plain text with clear paragraph breaks. No markdown headers, no bullet points.";

/**
 * Human-readable explanation for UI. "Failed to fetch" is almost always network / how you open the page — not a wrong API key.
 * @param {unknown} err
 * @returns {string}
 */
export function explainApiFailure(err) {
  const msg = err && typeof err === "object" && "message" in err ? String(err.message) : String(err);
  const isNetwork =
    /failed to fetch|networkerror|load failed|aborted|err_network|fetch/i.test(msg) ||
    (err && typeof err === "object" && (err.name === "TypeError" || err.name === "AbortError"));

  if (isNetwork) {
    return (
      `【网络错误】${msg}\n\n` +
      `这通常不是 API Key 填错。Key 错误时服务器会返回 401 等明确错误，而不是 “Failed to fetch”。\n\n` +
      `请按顺序排查：\n` +
      `1）必须用本地 HTTP 打开：在 files 文件夹执行  python3 -m http.server 8080  ，浏览器访问  http://localhost:8080/  ，不要用「文件」方式打开（file:// 容易导致请求失败）。\n\n` +
      `2）本机网络能否访问  https://api.anthropic.com  （部分地区或公司网络会拦截；可换网络、代理或 VPN 后再试）。\n\n` +
      `3）暂时关闭广告拦截 / 隐私类扩展；按 F12 → Network，看是否有发往 api.anthropic.com 的请求、状态码是什么。\n\n` +
      `若 Network 里状态码是 **403** 且有 JSON 报错，多半是**密钥或账号权限**问题，不是「没连上网」。`
    );
  }

  if (/403|forbidden|request not allowed/i.test(msg)) {
    return (
      `${msg}\n\n` +
      `【说明】能访问 Anthropic 域名 ≠ 请求被接受。HTTP 403 表示服务器拒绝本次调用，常见原因：\n` +
      `· API Key 错误、已删除或已轮换失效\n` +
      `· 账号未完成验证 / 未开通 API / 计费或用量限制\n` +
      `· 部分地区的账号策略限制\n\n` +
      `请到 https://console.anthropic.com/ 重新创建 API Key，核对 Billing 与 API 状态；不要使用其它平台（如 OpenAI）的密钥。`
    );
  }

  if (/401|authentication|invalid|api[_ ]?key|permission/i.test(msg)) {
    return `${msg}\n\n请到 files/config.js 检查 API_KEY：是否完整复制、前后是否多了空格或引号。`;
  }

  return `${msg}\n\n若仍无法解决：F12 打开开发者工具 → Console / Network 查看完整报错。`;
}

/**
 * Send a single-turn request to Claude.
 * @param {string} user    - The user message / prompt
 * @param {string} [system] - Optional system prompt override
 * @param {{max_tokens?: number}} [opts] - Optional max output tokens (blog drafts need more headroom)
 * @returns {Promise<string>} - The assistant's text response
 */
export async function callClaude(user, system, opts) {
  const max_tokens = opts && typeof opts.max_tokens === "number" ? opts.max_tokens : 2048;

  if (!KEY || KEY === "YOUR_ANTHROPIC_API_KEY") {
    throw new Error(
      "请先在 files/config.js 中将 API_KEY 设为你在 Anthropic Console 创建的真实密钥（替换占位符 YOUR_ANTHROPIC_API_KEY）。"
    );
  }

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens,
        system: system || DEFAULT_SYSTEM,
        messages: [{ role: "user", content: user }],
      }),
    });
  } catch (e) {
    throw e;
  }

  const rawText = await res.text();
  let d = {};
  try {
    d = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(`HTTP ${res.status}: response was not JSON (${rawText.slice(0, 120)}…)`);
  }

  if (!res.ok) {
    const apiMsg = d.error?.message || d.message || rawText.slice(0, 300);
    throw new Error(apiMsg || `HTTP ${res.status}`);
  }
  if (d.error) throw new Error(d.error.message || String(d.error));

  return d.content?.map((b) => b.text || "").join("") || "";
}
