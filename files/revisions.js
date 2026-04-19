// ── REVISION WORKFLOW ─────────────────────────────────────────────────────
import { callClaude } from "./api.js";
import { S } from "./state.js";
import { getSelTags, showBlogVer, showNlVer } from "./ui.js";

/**
 * Request an AI revision of the currently selected blog post or newsletter.
 * @param {"blog"|"nl"} type
 */
export async function applyRevision(type) {
  const isBlog    = type === "blog";
  const tagsId    = isBlog ? "blog-rev-tags"    : "nl-rev-tags";
  const noteId    = isBlog ? "blog-rev-note"    : "nl-rev-note";
  const resultId  = isBlog ? "blog-rev-result"  : "nl-rev-result";
  const contentId = isBlog ? "blog-rev-content" : "nl-rev-content";

  const tags = getSelTags(tagsId);
  const note = document.getElementById(noteId).value.trim();
  if (!tags && !note) {
    alert("Please select a revision tag or describe your change.");
    return;
  }

  const instructions = [tags, note].filter(Boolean).join(". ");
  const currentText  = isBlog
    ? S.blogVersions[S.selectedBlog] || ""
    : (S.newsletters[S.currentPersona] || [])[S.selectedNl[S.currentPersona]] || "";

  document.getElementById(resultId).style.display = "block";
  document.getElementById(contentId).textContent  = "Applying revision...";
  document.getElementById(contentId).className    = "cbox short loading";

  const revised = await callClaude(
    `Here is a piece of marketing content for NovaMind:\n\n${currentText}\n\nApply this revision: ${instructions}\n\nReturn only the fully revised content — no explanations, no preamble.`
  );

  document.getElementById(contentId).textContent = revised;
  document.getElementById(contentId).className   = "cbox short";
}

/**
 * Accept the revised version and replace the current selection.
 * @param {"blog"|"nl"} type
 */
export function acceptRevision(type) {
  const isBlog  = type === "blog";
  const revised = document.getElementById(isBlog ? "blog-rev-content" : "nl-rev-content").textContent;

  if (isBlog) {
    S.blogVersions[S.selectedBlog] = revised;
    showBlogVer(S.selectedBlog);
  } else {
    S.newsletters[S.currentPersona][S.selectedNl[S.currentPersona]] = revised;
    showNlVer(S.selectedNl[S.currentPersona]);
  }

  document.getElementById(isBlog ? "blog-rev-result" : "nl-rev-result").style.display = "none";
}

/**
 * Discard the pending revision without applying it.
 * @param {"blog"|"nl"} type
 */
export function discardRevision(type) {
  document.getElementById(type === "blog" ? "blog-rev-result" : "nl-rev-result").style.display = "none";
}
