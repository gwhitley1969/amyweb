// Home video carousel behavior — served as a static same-origin file
// BY DESIGN: the CSP is script-src 'self' (no unsafe-inline), so an
// Astro-inlined component script is silently dead on the real host
// (DECISIONS 2026-08-14, CSP inline-script gap). Globally forcing
// scripts external via assetsInlineLimit:0 regressed every page's
// inlined CSS (+~70ms LCP on the heaviest page — the CI catch), so the
// externalization is scoped to exactly this file. Behavior contract
// lives in src/components/VideoCarousel.astro.
//
// PHONES (2026-09-03, DECISIONS same date — "the carousel doesn't
// autoplay on phones", reported from Android): prefers-reduced-motion no
// longer gates playback (operator decision: the films are content with a
// pause control; only the CSS crossfade stands down), a refused play()
// is retried inside the person's first gesture, and the built <video>
// carries the muted + playsinline ATTRIBUTES as well as the properties.
const stage = document.querySelector('[data-vc-stage]');
if (stage) {
  const slideEls = [...stage.querySelectorAll('.vc-slide')];
  const bars = [...document.querySelectorAll('.vc-bar')];
  const fills = bars.map((b) => b.querySelector('.vc-fill'));
  const toggle = document.querySelector('.vc-toggle');
  let current = 0;
  let playing = false;
  let userPaused = false;
  let inView = false;
  let unlockArmed = false;

  // Facade: the <video> exists only after this runs for its slide.
  const buildVideo = (el, i) => {
    let v = el.querySelector('video');
    if (v) return v;
    v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    // Attributes beside the properties: iOS is known to check the
    // `muted` attribute on a script-built element when deciding whether
    // it may start without a gesture; the legacy inline attribute is
    // for older WebKit.
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('aria-label', el.dataset.label);
    // Per-slide tempo (data-rate; unset = 1). Both properties so a
    // media reload keeps the rate, and re-asserted on loadedmetadata
    // and play — some engines (Safari/iOS) reset the rate when
    // playback (re)starts. Captions/progress key off media time, so
    // they stay in sync at any rate.
    const rate = parseFloat(el.dataset.rate || '1');
    v.defaultPlaybackRate = v.playbackRate = rate;
    v.addEventListener('loadedmetadata', () => {
      v.playbackRate = rate;
    });
    v.addEventListener('play', () => {
      v.playbackRate = rate;
    });
    const source = document.createElement('source');
    source.src = el.dataset.file;
    source.type = 'video/mp4';
    const track = document.createElement('track');
    track.kind = 'captions';
    track.src = el.dataset.vtt;
    track.srclang = 'en';
    track.label = 'English';
    v.append(source, track);
    v.addEventListener('timeupdate', () => {
      if (i === current && v.duration) {
        fills[i].style.transform = `scaleX(${v.currentTime / v.duration})`;
      }
    });
    v.addEventListener('ended', () => {
      if (i === current) show((current + 1) % slideEls.length, !userPaused);
    });
    el.append(v);
    v.load();
    return v;
  };

  const sync = () => {
    toggle.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pause the films' : 'Play the films');
  };

  // A play() the phone refuses (iOS Low Power Mode, battery/data modes —
  // no user activation yet) is retried INSIDE the person's first
  // gesture, which is exactly what those policies wait for. A
  // touch-scroll's touchend counts, so the first scroll unlocks the
  // band. One-shot; re-armed only by another refusal.
  const armUnlock = () => {
    if (unlockArmed) return;
    unlockArmed = true;
    const events = ['touchend', 'pointerup', 'keydown'];
    const retry = () => {
      events.forEach((t) => document.removeEventListener(t, retry, true));
      unlockArmed = false;
      if (inView && !userPaused && !playing) play();
    };
    events.forEach((t) => document.addEventListener(t, retry, { capture: true, passive: true }));
  };

  const play = () => {
    const v = buildVideo(slideEls[current], current);
    v.muted = true;
    v.play()
      .then(() => {
        playing = true;
        sync();
      })
      .catch(() => {
        playing = false;
        sync();
        armUnlock();
      });
    // Warm the next slide so the crossfade lands on ready frames.
    const next = (current + 1) % slideEls.length;
    buildVideo(slideEls[next], next);
  };

  const pause = () => {
    const v = slideEls[current].querySelector('video');
    if (v) v.pause();
    playing = false;
    sync();
  };

  const show = (i, autoplay) => {
    if (i === current) {
      if (autoplay) play();
      else pause();
      return;
    }
    const prev = slideEls[current].querySelector('video');
    if (prev) prev.pause();
    slideEls[current].classList.remove('is-active');
    fills[current].style.transform = 'scaleX(0)';
    current = i;
    const el = slideEls[current];
    el.classList.add('is-active');
    const v = el.querySelector('video');
    if (v) v.currentTime = 0;
    bars.forEach((b, n) => b.setAttribute('aria-current', n === current ? 'true' : 'false'));
    playing = false;
    if (autoplay) play();
    else sync();
  };

  bars.forEach((b, i) =>
    b.addEventListener('click', () => {
      userPaused = false;
      show(i, true);
    })
  );

  toggle.addEventListener('click', () => {
    if (playing) {
      userPaused = true;
      pause();
    } else {
      userPaused = false;
      play();
    }
  });

  // Autoplay only once the stage is actually on screen; pause when it
  // leaves; never resume over an explicit user pause. Since 2026-09-03
  // this runs under prefers-reduced-motion too (operator decision: the
  // films are content; the CSS crossfade is what stands down).
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        inView = e.isIntersecting;
        if (inView) {
          if (!userPaused && !playing) play();
        } else if (playing) {
          pause();
        }
      }
    },
    { threshold: 0.35 }
  );
  io.observe(stage);
}
