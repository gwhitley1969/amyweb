/* HOME CONCEPT (2026-09-03, DECISIONS same date): sets html.motion BEFORE
 * first paint so the choreographed elements can start hidden without a
 * flash. Off under reduced motion (the page is then the CSS-only home
 * from the same branch). Self-cancels if /js/home-motion.js never
 * reports in, so nothing can stay hidden if a script fails to load.
 * Loaded synchronously in the head from ConceptHome's head slot; the
 * operator lifted the zero-JS rule for this branch only. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var h = document.documentElement;
  h.classList.add('motion');
  setTimeout(function () {
    if (!window.__ncMotionReady) h.classList.remove('motion');
  }, 4000);
})();
