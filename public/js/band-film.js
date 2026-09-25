// The home band's film — Amy's van-trip clip in the "Amy comes to you."
// band (2026-09-25, DECISIONS same date). Served as a static same-origin
// file BY DESIGN (CSP script-src 'self', no unsafe-inline — DECISIONS
// 2026-08-14). The markup contract lives in ConceptHome.astro: a
// [data-band-film] figure carrying data-file / data-vtt / data-label
// around the poster <img>.
//  - The player is BUILT, not server-rendered: a server <video> would
//    fetch its poster at parse and put the film in the home page's byte
//    budget. It is built once, when the band is within 1.5 viewports AND
//    the person has touched, clicked, scrolled a wheel, or pressed a key.
//    Lighthouse's full-page pass loads lazy images without any input, so
//    it never builds the player or fetches the film.
//  - It plays MUTED (the rendition has no audio track) when roughly a
//    third of it is on screen, loops while in view, and pauses when it
//    leaves — the treatment-video.js values. The native controls are the
//    pause mechanism (WCAG 2.2.2), so it runs under prefers-reduced-motion
//    too: the films policy (CLAUDE.md constraint 6).
//  - The muted/playsinline attributes are set before the first play():
//    WebKit's autoplay policy reads the ATTRIBUTES (the carousel's
//    recorded lesson); webkit-playsinline is for older iOS.
//  - A refused play() (iOS Low Power Mode, data savers) is retried inside
//    the person's next gesture; until then the poster and the native play
//    control show.
//  - A user's pause is respected: scrolling away and back never resumes
//    over it.
const fig = document.querySelector('[data-band-film]');
if (fig && fig.dataset.file && 'IntersectionObserver' in window) {
  const img = fig.querySelector('img');
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  let hadInput = false;
  let near = false;
  let built = false;
  let v = null;
  let inView = false;

  const unlockEvents = ['touchend', 'pointerup', 'keydown'];
  let unlockArmed = false;
  const armUnlock = () => {
    if (unlockArmed) return;
    unlockArmed = true;
    const retry = () => {
      unlockEvents.forEach((t) => document.removeEventListener(t, retry, true));
      unlockArmed = false;
      if (v && inView && v.dataset.userPaused !== '1' && v.paused) start();
    };
    unlockEvents.forEach((t) => document.addEventListener(t, retry, { capture: true, passive: true }));
  };
  const start = () => {
    v.muted = true;
    v.setAttribute('muted', '');
    v.play().catch(armUnlock);
  };

  const build = () => {
    if (built) return;
    built = true;
    v = document.createElement('video');
    v.className = 'nc-photo nc-band__film';
    v.controls = true;
    v.loop = true;
    v.muted = true;
    v.preload = 'auto';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('aria-label', fig.dataset.label || '');
    const poster = img && (img.currentSrc || img.src);
    if (poster) v.poster = poster;
    const source = document.createElement('source');
    source.src = fig.dataset.file;
    source.type = 'video/mp4';
    const track = document.createElement('track');
    track.kind = 'captions';
    track.src = fig.dataset.vtt;
    track.srclang = 'en';
    track.label = 'English';
    v.append(source, track);
    v.addEventListener('pause', () => {
      if (v.dataset.autoPause === '1') delete v.dataset.autoPause;
      else if (!v.ended) v.dataset.userPaused = '1';
    });
    v.addEventListener('play', () => {
      delete v.dataset.userPaused;
    });
    fig.append(v);
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          inView = e.isIntersecting;
          if (inView) {
            if (v.paused && v.dataset.userPaused !== '1') start();
          } else if (!v.paused) {
            v.dataset.autoPause = '1';
            v.pause();
          }
        }
      },
      { threshold: 0.35, rootMargin: '200px 0px' },
    ).observe(fig);
  };

  // The poster doubles as the <video>'s poster attribute (the same URL,
  // already cached), so the build waits for it — with a timeout, so a
  // failed image never holds the film back.
  const maybeBuild = () => {
    if (built || !near || !hadInput) return;
    if (img && !img.complete) {
      const go = () => build();
      img.addEventListener('load', go, { once: true });
      img.addEventListener('error', go, { once: true });
      setTimeout(go, 3000);
    } else build();
  };
  const onInput = () => {
    inputs.forEach((t) => document.removeEventListener(t, onInput, true));
    hadInput = true;
    maybeBuild();
  };
  inputs.forEach((t) => document.addEventListener(t, onInput, { capture: true, passive: true }));
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) near = e.isIntersecting;
      maybeBuild();
    },
    { rootMargin: '150% 0px' },
  ).observe(fig);
}
