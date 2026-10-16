const SPLIT_VIEW_ID_NONE = -1;
const MAX_URL_LENGTH = 8192;

// Content scripts run in untrusted pages, so re-check the URL here
function sanitizeUrl(value) {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id || !sender.tab) return;
  if (message?.type !== "open-in-split") return;

  const url = sanitizeUrl(message.url);
  if (!url) return;

  openInSplit(sender.tab, url).catch((err) =>
    console.error("Split Viewer:", err)
  );
});

async function openInSplit(sourceTab, url) {
  // Already in a split: load the link into the other pane instead of nesting
  if (sourceTab.splitViewId !== undefined && sourceTab.splitViewId !== SPLIT_VIEW_ID_NONE) {
    const tabs = await chrome.tabs.query({ windowId: sourceTab.windowId });
    const partner = tabs.find(
      (t) => t.splitViewId === sourceTab.splitViewId && t.id !== sourceTab.id
    );
    if (partner) {
      await chrome.tabs.update(partner.id, { url });
      return;
    }
  }

  try {
    // Creates the new tab to the right of sourceTab, paired in split view
    await chrome.tabs.create({ url, splitWithTabId: sourceTab.id });
  } catch (err) {
    // Older Chrome or a tab that can't be split: fall back to an adjacent tab
    console.warn("Split Viewer: split view unavailable, opening a tab instead.", err);
    await chrome.tabs.create({
      url,
      index: sourceTab.index + 1,
      openerTabId: sourceTab.id,
    });
  }
}
