// Ctrl+Shift+Click (Cmd+Shift+Click on macOS) on a link opens it in split view.

function findLink(event) {
  for (const el of event.composedPath()) {
    if (el instanceof Element && el.matches("a[href], area[href]")) return el;
  }
  return null;
}

function resolveHref(link) {
  // SVG <a> exposes href as an SVGAnimatedString
  const raw = typeof link.href === "string" ? link.href : link.href.baseVal;
  try {
    return new URL(raw, document.baseURI).href;
  } catch {
    return null;
  }
}

window.addEventListener(
  "click",
  (event) => {
    // Ignore synthetic clicks so pages can't open tabs without a real user click
    if (!event.isTrusted) return;
    if (event.button !== 0 || !event.shiftKey) return;
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

    const link = findLink(event);
    if (!link) return;

    const url = resolveHref(link);
    // Leave other schemes (javascript:, data:, file:, ...) to the browser
    if (!url || !/^https?:/i.test(url)) return;

    // Stop Chrome's default "open in new foreground tab" and page handlers
    event.preventDefault();
    event.stopImmediatePropagation();

    chrome.runtime.sendMessage({ type: "open-in-split", url });
  },
  true
);
