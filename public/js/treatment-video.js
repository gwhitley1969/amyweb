// Treatment-page film autoplay-in-view — served as a static same-origin
// file BY DESIGN (CSP script-src 'self', no unsafe-inline; an inlined
// component script is silently dead on the real host — DECISIONS
// 2026-08-14). Behavior contract lives in src/components/TreatmentVideo.astro:
// only players that opt in with data-autoplay="inview" are touched.
//  - When roughly a third of a film is on screen (pre-warmed a little
//    before), it plays MUTED — browsers allow autoplay only muted; the
//    visible controls are the tap-for-sound. The `loop` attribute keeps
//    it running while in view; leaving the viewport pauses it.
//  - This runs under prefers-reduced-motion too (operator decision
//    2026-09-03, the carousel's policy extended to these players — the
//    films are content with a pause control, WCAG 2.2.2's mechanism is
//    the native controls; DECISIONS same date). Before that, reduced
//    motion meant click-to-play here.
//  - A play() the phone refuses (iOS Low Power Mode, battery/data modes
//    — no user activation yet) is retried INSIDE the person's first
//    gesture, which is exactly what those policies wait for. A
//    touch-scroll's touchend counts, so the first scroll unlocks the
//    film. One-shot; re-armed only by another refusal.
//  - The muted/playsinline attributes are set on the element before the
//    first play(): WebKit's autoplay policy reads the ATTRIBUTES, not
//    only the properties (the carousel's recorded lesson); the legacy
//    webkit-playsinline is for older iOS.
//  - An explicit user pause is respected: the observer never resumes
//    over it. A user unmute is remembered for the next in-view start
//    (falls back to muted if the browser refuses).
const films = [...document.querySelectorAll('video[data-autoplay="inview"]')];
if (films.length && 'IntersectionObserver' in window) {
  const unlockEvents = ['touchend', 'pointerup', 'keydown'];
  let unlockArmed = false;
  const armUnlock = () => {
    if (unlockArmed) return;
    unlockArmed = true;
    const retry = () => {
      unlockEvents.forEach((t) => document.removeEventListener(t, retry, true));
      unlockArmed = false;
      for (const v of films) {
        if (v.dataset.inView === '1' && v.dataset.userPaused !== '1' && v.paused) start(v);
      }
    };
    unlockEvents.forEach((t) => document.addEventListener(t, retry, { capture: true, passive: true }));
  };
  const start = (v) => {
    const wantSound = v.dataset.unmuted === '1';
    v.muted = !wantSound;
    if (!wantSound) v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.play().catch(() => {
      v.muted = true;
      v.setAttribute('muted', '');
      v.play().catch(armUnlock);
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target;
        v.dataset.inView = e.isIntersecting ? '1' : '0';
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
