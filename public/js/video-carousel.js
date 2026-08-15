// Home video carousel behavior — served as a static same-origin file
// BY DESIGN: the CSP is script-src 'self' (no unsafe-inline), so an
// Astro-inlined component script is silently dead on the real host
// (DECISIONS 2026-08-14, CSP inline-script gap). Globally forcing
// scripts external via assetsInlineLimit:0 regressed every page's
// inlined CSS (+~70ms LCP on the heaviest page — the CI catch), so the
// externalization is scoped to exactly this file. Behavior contract
// lives in src/components/VideoCarousel.astro.
const stage = document.querySelector('[data-vc-stage]');
if (stage) {
  const slideEls = [...stage.querySelectorAll('.vc-slide')];
  const bars = [...document.querySelectorAll('.vc-bar')];
  const fills = bars.map((b) => b.querySelector('.vc-fill'));
  const toggle = document.querySelector('.vc-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let playing = false;
  let userPaused = false;

  // Facade: the <video> exists only after this runs for its slide.
  const buildVideo = (el, i) => {
    let v = el.querySelector('video');
    if (v) return v;
    v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-label', el.dataset.label);
    // Per-slide tempo (data-rate; unset = 1). Both properties so a
    // media reload keeps the rate. Captions/progress key off media
    // time, so they stay in sync at any rate.
    v.defaultPlaybackRate = v.playbackRate = parseFloat(el.dataset.rate || '1');
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
      if (i === current) show((current + 1) % slideEls.length, !reduced && !userPaused);
    });
    el.append(v);
    v.load();
    return v;
  };

  const sync = () => {
    toggle.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pause the films' : 'Play the films');
  };

  const play = () => {
    const v = buildVideo(slideEls[current], current);
    v.muted = true;
    v.play()
      .then(() => {
        playing = true;
        sync();
      })
      .catch(() => {});
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

  if (!reduced) {
    // Autoplay only once the stage is actually on screen; pause when it
    // leaves; never resume over an explicit user pause.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
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
}
