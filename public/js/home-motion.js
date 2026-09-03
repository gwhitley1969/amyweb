/* HOME CONCEPT — "the neon comes on" (2026-09-03, DECISIONS same date).
 *
 * The operator lifted the zero-JS rule FOR THIS BRANCH (a concept test).
 * GSAP 3.15 (core + ScrollTrigger + SplitText; free under the GSAP
 * standard license since 3.13) and Lenis 1.3 (MIT) are self-hosted in
 * /js/vendor — script-src stays 'self'. Everything here is ADDITIVE:
 * under reduced motion, or if these scripts fail, home-motion removes
 * html.motion and the page is the CSS-only home from the same branch.
 *
 * Choreography:
 *  1. Load — the wordmark's neon flickers on; the headline rises word
 *     by word (blur → sharp); "made personal." switches on like a tube;
 *     lead, CTAs, chips, and the chevron cue follow.
 *  2. Hero film — Amy's own studio reel (the carousel's muted rendition,
 *     0.5× — the recorded tempo) is attached a beat after `load`, poster
 *     first, and fades in. Pauses off-screen.
 *  3. Leaving the hero — the copy lifts away and the film swells (scrub).
 *  4. Every section opener rises word by word as it enters.
 *  5. Decks settle in; the three doors are dealt one after another.
 *  6. Photos rise into their arches and settle.
 *  7. The van band's photo parallaxes against the scroll.
 *  8. A faint magenta light follows the cursor over noir surfaces.
 * Lenis gives the scroll its weight (pointer devices only; anchors kept).
 */
(() => {
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ok = window.gsap && window.ScrollTrigger && window.SplitText;
  if (reduced || !ok) {
    html.classList.remove('motion');
    return;
  }
  window.__ncMotionReady = true;
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const finePointer = matchMedia('(pointer: fine)').matches;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- Lenis: weighted scroll on pointer devices; ScrollTrigger rides it.
  if (window.Lenis && finePointer) {
    const lenis = new window.Lenis({ lerp: 0.09, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const NEON = 'rgba(254, 1, 154, ';

  // ---- 1. The neon comes on
  const hero = q('.nc-hero');
  const copy = q('.nc-hero__copy');
  const heroImg = q('.nc-hero__img');
  const sign = q('.site-brand img');
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (sign) {
    intro.fromTo(
      sign,
      { opacity: 0.12, filter: `drop-shadow(0 0 0 ${NEON}0))` },
      {
        keyframes: [
          { opacity: 0.12, duration: 0.14 },
          { opacity: 1, duration: 0.05 },
          { opacity: 0.25, duration: 0.09 },
          { opacity: 1, duration: 0.05 },
          { opacity: 0.5, duration: 0.14 },
          { opacity: 1, duration: 0.06 },
          { opacity: 0.8, duration: 0.18 },
          { opacity: 1, filter: `drop-shadow(0 0 22px ${NEON}.55))`, duration: 0.7 },
        ],
        ease: 'none',
      },
      0,
    );
  }
  if (heroImg) {
    intro.fromTo(heroImg, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: 'power2.out' }, 0);
  }
  if (copy) {
    const eyebrow = q('.eyebrow', copy);
    const h1 = q('h1', copy);
    const rest = qa(':scope > *', copy).filter((el) => el !== eyebrow && el !== h1);
    gsap.set(copy.children, { visibility: 'visible' });
    if (eyebrow) intro.from(eyebrow, { autoAlpha: 0, y: 12, duration: 0.6 }, 0.35);
    if (h1) {
      const split = new SplitText(h1, { type: 'words', aria: 'auto' });
      intro.from(
        split.words,
        { autoAlpha: 0, yPercent: 70, filter: 'blur(10px)', duration: 0.9, stagger: 0.09 },
        0.5,
      );
      const accent = q('.display-accent', h1);
      if (accent) {
        // The tube switches on: the CSS shimmer is held off (nc-neon-off)
        // while the flicker runs on the same text-shadow, then released.
        accent.classList.add('nc-neon-off');
        intro.fromTo(
          accent,
          { textShadow: `0 0 0 ${NEON}0)` },
          {
            keyframes: [
              { textShadow: `0 0 30px ${NEON}.9)`, duration: 0.06 },
              { textShadow: `0 0 4px ${NEON}.2)`, duration: 0.07 },
              { textShadow: `0 0 30px ${NEON}.9)`, duration: 0.06 },
              { textShadow: `0 0 10px ${NEON}.35)`, duration: 0.1 },
              { textShadow: `0 0 26px ${NEON}.7)`, duration: 0.5 },
            ],
            ease: 'none',
            onComplete: () => {
              gsap.set(accent, { clearProps: 'textShadow' });
              accent.classList.remove('nc-neon-off');
            },
          },
          '>-0.25',
        );
      }
    }
    if (rest.length) intro.from(rest, { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.12 }, '>-0.45');
  }

  // ---- 2. Hero film facade: the studio reel, poster first, a beat after load
  const media = q('[data-hero-film]');
  if (media) {
    const attach = () => {
      const v = document.createElement('video');
      v.className = 'nc-hero__film';
      v.muted = true;
      v.loop = true;
      v.preload = 'auto';
      v.setAttribute('playsinline', '');
      v.setAttribute('aria-label', media.dataset.label || '');
      const rate = parseFloat(media.dataset.rate || '1');
      v.defaultPlaybackRate = v.playbackRate = rate;
      v.addEventListener('loadedmetadata', () => {
        v.playbackRate = rate;
      });
      v.addEventListener('play', () => {
        v.playbackRate = rate;
      });
      const source = document.createElement('source');
      source.src = media.dataset.file;
      source.type = 'video/mp4';
      const track = document.createElement('track');
      track.kind = 'captions';
      track.src = media.dataset.vtt;
      track.srclang = 'en';
      track.label = 'English';
      v.append(source, track);
      gsap.set(v, { opacity: 0 });
      // Windows: data-ranges="start-end,start-end" (seconds of the master)
      // plays only those passages in order and loops — a trim, recorded
      // as an editorial choice (DECISIONS 2026-09-03 addendum). Each
      // passage then RESTS on its last frame for data-hold seconds
      // (operator's first tweak, same day: the passages are short, so
      // without the hold the film cut every one to three seconds) and
      // dissolves — 0.6s out, 1.1s in — into the next.
      const ranges = (media.dataset.ranges || '')
        .split(',')
        .map((r) => r.split('-').map(Number))
        .filter((r) => r.length === 2 && r[1] > r[0]);
      let onScreen = true;
      let holding = false;
      let done = false;
      if (ranges.length) {
        v.loop = false;
        const hold = Math.max(0, parseFloat(media.dataset.hold || '3'));
        // data-plays: full passes through the windows before the film ends
        // for good — it dissolves out over the portrait it faded in from,
        // and the portrait settles (operator's second tweak, same day:
        // "run two times, then rest on the original hero pic"). 0 or
        // absent = loop forever. Off-screen time never counts: the film
        // pauses when the hero leaves the viewport and resumes in place.
        const plays = Math.max(0, parseInt(media.dataset.plays || '0', 10));
        let passes = 0;
        let ri = 0;
        let seeking = false;
        let timer = 0;
        const jump = (i) => {
          ri = i;
          seeking = true;
          v.currentTime = ranges[ri][0];
          gsap.fromTo(v, { opacity: 0.35 }, { opacity: 1, duration: 1.1, ease: 'power2.out', overwrite: 'auto' });
        };
        const finish = () => {
          done = true;
          gsap.to(v, {
            opacity: 0,
            duration: 1.8,
            ease: 'power2.inOut',
            overwrite: 'auto',
            onComplete: () => {
              v.pause();
              clearInterval(timer);
              v.remove(); // the portrait is the page again; nothing keeps decoding
            },
          });
          if (heroImg) gsap.fromTo(heroImg, { scale: 1.04 }, { scale: 1, duration: 3, ease: 'power2.out', overwrite: 'auto' });
        };
        const endWindow = () => {
          if (holding || done) return;
          holding = true;
          v.pause(); // rest on the last frame
          setTimeout(() => {
            const next = (ri + 1) % ranges.length;
            if (next === 0) passes += 1;
            if (plays && passes >= plays) {
              finish();
              return;
            }
            gsap.to(v, {
              opacity: 0.35,
              duration: 0.6,
              ease: 'power2.in',
              overwrite: 'auto',
              onComplete: () => {
                jump(next);
                holding = false;
                if (onScreen) v.play().catch(() => {});
              },
            });
          }, hold * 1000);
        };
        v.addEventListener('seeked', () => { seeking = false; });
        v.addEventListener('loadedmetadata', () => { v.currentTime = ranges[0][0]; }, { once: true });
        // Three clocks watch the window's end (a frame callback alone can
        // lag in a background tab): the video-frame callback, timeupdate,
        // and a 40ms interval — the margin is one 0.5× frame.
        const tick = () => {
          if (!done && !seeking && !holding && v.currentTime >= ranges[ri][1] - 0.05) endWindow();
        };
        if ('requestVideoFrameCallback' in v) {
          const onFrame = () => { tick(); if (!done) v.requestVideoFrameCallback(onFrame); };
          v.requestVideoFrameCallback(onFrame);
        }
        v.addEventListener('timeupdate', tick);
        timer = setInterval(tick, 40);
        v.addEventListener('ended', () => { if (!holding) endWindow(); });
      }
      media.append(v);
      v.addEventListener(
        'canplay',
        () => {
          v.play()
            .then(() => gsap.to(v, { opacity: 1, duration: 1.6, ease: 'power2.out' }))
            .catch(() => {});
        },
        { once: true },
      );
      new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            onScreen = e.isIntersecting;
            if (onScreen) {
              if (!holding && !done) v.play().catch(() => {});
            } else v.pause();
          }
        },
        { threshold: 0.1 },
      ).observe(media);
      v.load();
    };
    const later = () => setTimeout(attach, 2500);
    if (document.readyState === 'complete') later();
    else addEventListener('load', later, { once: true });
  }

  // ---- 3. Leaving the hero: the copy lifts away, the film swells
  if (hero && copy && media) {
    gsap
      .timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } })
      .to(copy, { yPercent: -16, opacity: 0.15, ease: 'none' }, 0)
      .to(media, { scale: 1.12, transformOrigin: '60% 40%', ease: 'none' }, 0);
  }

  // ---- 4. Section openers rise word by word
  qa('main h2').forEach((h2) => {
    if (h2.closest('.nc-hero')) return;
    const split = new SplitText(h2, { type: 'words', aria: 'auto' });
    gsap.set(h2, { visibility: 'visible' });
    gsap.from(split.words, {
      autoAlpha: 0,
      yPercent: 80,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: h2, start: 'top 85%', once: true },
    });
  });

  // ---- 5. Decks settle; the doors are dealt
  qa('.ng-rise:not(.nc-door)').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 28,
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  const doors = qa('.nc-door');
  if (doors.length) {
    gsap.from(doors, {
      autoAlpha: 0,
      y: 64,
      rotation: -2.5,
      transformOrigin: 'left bottom',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.14,
      clearProps: 'all',
      scrollTrigger: { trigger: doors[0].parentElement, start: 'top 80%', once: true },
    });
  }

  // ---- 6. Photos rise into their arches (and the print) and settle
  qa('.ng-arch img, .nc-post img').forEach((img) => {
    gsap.from(img, {
      yPercent: 30,
      scale: 1.18,
      autoAlpha: 0,
      duration: 1.3,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: img, start: 'top 90%', once: true },
    });
  });

  // ---- 7. The van band: the photo moves against the scroll (the host's
  // 24px overflow bounds the travel — ±4% of ~550px)
  const bandImg = q('.nc-band__media img');
  if (bandImg) {
    gsap.fromTo(
      bandImg,
      { yPercent: -4 },
      { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.nc-band', start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }

  // ---- 8. The cursor light over noir
  if (finePointer) {
    const glow = document.createElement('div');
    glow.className = 'nc-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.append(glow);
    const toX = gsap.quickTo(glow, 'x', { duration: 0.5, ease: 'power3' });
    const toY = gsap.quickTo(glow, 'y', { duration: 0.5, ease: 'power3' });
    const toO = gsap.quickTo(glow, 'opacity', { duration: 0.4 });
    addEventListener(
      'pointermove',
      (e) => {
        toX(e.clientX);
        toY(e.clientY);
        const t = e.target;
        toO(t && t.closest && t.closest('[data-surface="noir"]') ? 1 : 0);
      },
      { passive: true },
    );
  }

  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
