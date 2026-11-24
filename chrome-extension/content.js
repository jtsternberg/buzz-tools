(() => {
  // Trailing punctuation is almost always sentence text, not part of the URL.
  const URL_RE = /buzz:\/\/[^\s<>"'`)\]]+?(?=[.,;:!?]*(?:[\s<>"'`)\]]|$))/g;
  const SKIP = new Set(['A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'NOSCRIPT', 'TEMPLATE']);

  function skippable(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (SKIP.has(el.tagName) || el.isContentEditable) return true;
    }
    return false;
  }

  function linkifyTextNode(node) {
    const text = node.nodeValue;
    URL_RE.lastIndex = 0;
    if (!URL_RE.test(text)) return;
    URL_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(URL_RE)) {
      if (m.index > last) frag.append(text.slice(last, m.index));
      const a = document.createElement('a');
      a.href = m[0];
      a.textContent = m[0];
      a.dataset.buzzLink = '';
      frag.append(a);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }

  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (root.nodeValue.includes('buzz://') && !skippable(root)) linkifyTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || SKIP.has(root.tagName)) return;
    if (!root.textContent.includes('buzz://')) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.includes('buzz://') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const hits = [];
    while (walker.nextNode()) hits.push(walker.currentNode);
    for (const n of hits) if (!skippable(n)) linkifyTextNode(n);
  }

  scan(document.body);

  // GitHub and most chat UIs render comments after load and on SPA navigation.
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') scan(m.target);
      else for (const n of m.addedNodes) scan(n);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
