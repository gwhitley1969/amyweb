// Treatment-page film autoplay-in-view — served as a static same-origin
// file BY DESIGN (CSP script-src 'self', no unsafe-inline; an inlined
// component script is silently dead on the real host — DECISIONS
// 2026-08-14). Behavior contract lives in src/components/TreatmentVideo.astro:
// only players that opt in with data-autoplay="inview" are touched.
//  - Nothing happens under prefers-reduced-motion: every start stays
//    user-initiated (WCAG 2.2.2; the native controls are the pause).
//  - When roughly a third of a film is on screen (pre-warmed a little
//    before), it plays MUTED — browsers allow autoplay only muted; the
//    visible controls are the tap-for-sound. The `loop` attribute keeps
//    it running while in view; leaving the viewport pauses it.
//  - An explicit user pause is respected: the observer never resumes
//    over it. A user unmute is remembered for the next in-view start
//    (falls back to muted if the browser refuses).
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const films = [...document.querySelectorAll('video[data-autoplay="inview"]')];
if (films.length && !reduced && 'IntersectionObserver' in window) {
  const start = (v) => {
    v.muted = v.dataset.unmuted !== '1';
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.paused && v.dataset.userPaused !== '1') start(v);
        } else if (!v.paused) {
          v.dataset.autoPause = '1';
          v.pause();
        }
      }
    },
    { threshold: 0.35, rootMargin: '200px 0px' }
  );
  for (const v of films) {
    v.addEventListener('pause', () => {
      if (v.dataset.autoPause === '1') delete v.dataset.autoPause;
      else if (!v.ended) v.dataset.userPaused = '1';
    });
    v.addEventListener('play', () => {
      delete v.dataset.userPaused;
    });
    v.addEventListener('volumechange', () => {
      v.dataset.unmuted = v.muted ? '0' : '1';
    });
    io.observe(v);
  }
}
