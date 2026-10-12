/**
 * Site search for /search (DECISIONS 2026-10-12). Loads Pagefind's runtime
 * (/pagefind/pagefind.js, built by `pagefind --site dist`) on the first
 * focus or keystroke, then renders each match as its page TITLE (minus the
 * " | Needle Girlie" suffix) and META DESCRIPTION only — never an excerpt
 * (see src/pages/search.astro). Everything is built with DOM nodes and
 * textContent; a query is never parsed as HTML. No storage, no analytics,
 * no requests beyond this site. The text rules live in site-search-text.js.
 */
import { cleanUrl, cleanTitle, splitPractice } from '/js/site-search-text.js';

const input = document.getElementById('site-search-input');
const status = document.getElementById('site-search-status');
const list = document.getElementById('site-search-results');
const practiceTpl = document.getElementById('site-search-practice-link');
const MAX_RESULTS = 10;

if (input && status && list && practiceTpl) {
  document.getElementById('site-search-nojs')?.remove();

  // A failed import clears the cache so a later keystroke can retry.
  let pagefind = null;
  const load = () =>
    (pagefind ??= import('/pagefind/pagefind.js').catch((e) => {
      pagefind = null;
      throw e;
    }));

  const setStatus = (text, state) => {
    status.textContent = text;
    status.dataset.state = state;
  };
  function description(text) {
    const p = document.createElement('p');
    p.className = 'mt-2';
    const parts = splitPractice(text);
    parts.forEach((part, i) => {
      p.append(part);
      if (i < parts.length - 1) p.append(practiceTpl.content.cloneNode(true));
    });
    return p;
  }

  function render(items, query) {
    list.replaceChildren(
      ...items.map(({ url, meta }) => {
        const li = document.createElement('li');
        const h2 = document.createElement('h2');
        h2.className = 'heading-4';
        const a = document.createElement('a');
        a.href = cleanUrl(url);
        a.className = 'underline underline-offset-4';
        a.style.color = 'var(--ng-link)';
        a.textContent = cleanTitle(meta?.title);
        h2.append(a);
        li.append(h2, description(meta?.description));
        return li;
      }),
    );
    const n = items.length;
    setStatus(
      n
        ? `${n} ${n === 1 ? 'page matches' : 'pages match'} “${query}”.`
        : `No pages match “${query}”. Try another word, or browse all of Amy's services from the menu.`,
      'done',
    );
  }

  async function run() {
    const query = input.value.trim();
    if (!query) {
      list.replaceChildren();
      setStatus('', 'idle');
      return;
    }
    setStatus('Searching…', 'busy');
    try {
      const pf = await load();
      const search = await pf.debouncedSearch(query);
      if (search === null) return; // superseded by a newer keystroke
      const items = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()));
      if (input.value.trim() !== query) return; // the box changed while loading
      render(items, query);
    } catch {
      list.replaceChildren();
      setStatus("Search isn't available right now. Every page is in the menu.", 'done');
    }
  }

  input.addEventListener(
    'focus',
    () => {
      load().catch(() => {});
    },
    { once: true },
  );
  input.addEventListener('input', run);

  const q = new URLSearchParams(location.search).get('q');
  if (q) {
    input.value = q;
    run();
  }
}
