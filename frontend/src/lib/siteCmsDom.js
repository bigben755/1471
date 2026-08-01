const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);

const norm = (v = "") => v.replace(/\s+/g, " ").trim();

export function elementDomKey(el, root) {
  const parts = [];
  let node = el;
  while (node && node !== root && node.nodeType === Node.ELEMENT_NODE) {
    const tag = node.tagName.toLowerCase();
    let idx = 1;
    let prev = node.previousElementSibling;
    while (prev) {
      if (prev.tagName === node.tagName) idx += 1;
      prev = prev.previousElementSibling;
    }
    parts.unshift(`${tag}[${idx}]`);
    node = node.parentElement;
  }
  return parts.join("/");
}

function textEntriesForParent(parent, root) {
  const keyBase = elementDomKey(parent, root);
  let idx = 0;
  const out = [];
  for (const n of parent.childNodes) {
    if (n.nodeType !== Node.TEXT_NODE) continue;
    const raw = n.textContent || "";
    if (!norm(raw)) continue;
    idx += 1;
    out.push({
      key: `${keyBase}::text[${idx}]`,
      value: raw,
      node: n,
    });
  }
  return out;
}

function shouldSkipElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  return !!el.closest('[data-cms-ignore="true"]');
}

export function extractPageEditableContent(root) {
  const texts = [];
  const images = [];
  if (!root) return { texts, images };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let el = root;
  while (el) {
    if (!shouldSkipElement(el)) {
      const entries = textEntriesForParent(el, root);
      entries.forEach((e) => {
        texts.push({ key: e.key, value: norm(e.value), original: e.value });
      });
      if (el.tagName === "IMG") {
        const src = el.getAttribute("src") || "";
        const alt = el.getAttribute("alt") || "";
        if (src) {
          images.push({ key: elementDomKey(el, root), src, alt });
        }
      }
    }
    el = walker.nextNode();
  }

  return { texts, images };
}

export function applyPageOverrides(root, overrides) {
  if (!root || !overrides) return;
  const textMap = overrides.texts || {};
  const imageMap = overrides.images || {};

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let el = root;
  while (el) {
    if (!shouldSkipElement(el)) {
      const textEntries = textEntriesForParent(el, root);
      textEntries.forEach((entry) => {
        const nextVal = textMap[entry.key];
        if (typeof nextVal === "string") {
          entry.node.textContent = nextVal;
        }
      });

      if (el.tagName === "IMG") {
        const key = elementDomKey(el, root);
        const next = imageMap[key];
        if (next && typeof next === "object") {
          if (typeof next.src === "string" && next.src.trim()) el.setAttribute("src", next.src);
          if (typeof next.alt === "string") el.setAttribute("alt", next.alt);
        }
      }
    }
    el = walker.nextNode();
  }
}
