/* HOME CONCEPT — "the neon comes on" (2026-09-03, DECISIONS same date).
 *
 * The operator lifted the zero-JS rule FOR THIS BRANCH (a concept test).
 * GSAP 3.15 (core + ScrollTrigger + SplitText; free under the GSAP
 * standard license since 3.13) and Lenis 1.3 (MIT) are self-hosted in
 * /js/vendor — script-src stays 'self'. Everything here is ADDITIVE:
 * if these scripts fail, home-motion removes html.motion and the page
 * is the CSS-only home from the same branch. Under reduced motion the
 * choreography stands down the same way, but the hero FILM still plays
 * (operator decision 2026-09-03 — films are content with the same
 * standing as the carousel's; the #180 carousel entry in DECISIONS).
 *
 * Choreography:
 *  1. Load — the wordmark's neon flickers on; the headline rises word
 *     by word (blur → sharp); "made personal." switches on like a tube;
 *     lead, CTAs, chips, and the chevron cue follow.
 *  2. Hero film — Amy's own studio reel (the carousel's muted rendition,
 *     0.5× — the recorded tempo) is attached a beat after `load`, poster
 *     first, and fades in; then runs continuously — a freeze-frame
 *     dissolve joining the three screened passages (tweak 4,
 *     2026-09-04). Pauses off-screen.
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
  if (!ok) {
    html.classList.remove('motion');
    return;
  }
  // Reduced motion: every decorative move stands down (motion-flag never
  // set html.motion; this guard keeps the choreography off), but the
  // hero FILM still plays — content with the same standing as the
  // carousel's films (operator decision 2026-09-03): muted, the joins
  // as cuts instead of dissolves (the carousel's precedent), the
  // portrait underneath.
  if (reduced) html.classList.remove('motion');
  window.__ncMotionReady = true;
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const finePointer = matchMedia('(pointer: fine)').matches;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const hero = q('.nc-hero');
  const copy = q('.nc-hero__copy');
  const heroImg = q('.nc-hero__img');
  const sign = q('.site-brand img');

  // ---- Lenis: weighted scroll on pointer devices; ScrollTrigger rides it.
  if (!reduced && window.Lenis && finePointer) {
    const lenis = new window.Lenis({ lerp: 0.09, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const NEON = 'rgba(254, 1, 154, ';

  // ---- 1. The neon comes on (choreography — off under reduced motion)
  if (!reduced) {
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
  } // end of choreography 1

  // ---- 2. Hero film facade: the studio reel, poster first, a beat after
  // load, running CONTINUOUSLY (operator's fourth tweak, 2026-09-04 —
  // DECISIONS, the home entry). One player, one freeze-frame canvas: at
  // a passage's last in-window frame the frame is drawn onto the canvas
  // (on top, opaque), the player seeks to the next passage and plays,
  // and the canvas dissolves away over data-xfade seconds — so no frame
  // past a window can show, the seek hides under the freeze, and the
  // next passage is already moving beneath it. (Two alternating players
  // did the same job but downloaded the reel four times over — 33 MB
  // measured — so the freeze-frame carries the join instead.) Runs under
  // reduced motion too (the guard at the top) with the dissolve reduced
  // to a cut on `seeked`, the carousel's precedent. Phones: the muted +
  // playsinline ATTRIBUTES ride beside the properties, and a refused
  // play() is retried inside the person's first gesture — the same
  // policy as the carousel's #180 fix.
  const media = q('[data-hero-film]');
  if (media) {
    const rate = parseFloat(media.dataset.rate || '1');
    // Windows: data-ranges="start-end,start-end" (seconds of the master),
    // played in order and looped — a trim, recorded as an editorial
    // choice (DECISIONS 2026-09-03 addendum; the second window's end
    // corrected 2026-09-04). data-plays: passes before the film stops
    // (0 = forever, the default since the fourth tweak). data-hold is
    // retired (a leftover value is ignored). data-xfade: the dissolve,
    // in seconds; 0 under reduced motion.
    const ranges = (media.dataset.ranges || '')
      .split(',')
      .map((r) => r.split('-').map(Number))
      .filter((r) => r.length === 2 && r[1] > r[0]);
    const plays = Math.max(0, parseInt(media.dataset.plays || '0', 10));
    const xfade = reduced ? 0 : Math.max(0, parseFloat(media.dataset.xfade || '0.8'));
    // data-still: seconds the film rests on Amy's PORTRAIT at the end of
    // every pass — the reel dissolves away to the still beneath it, waits,
    // and dissolves back in at the first passage (operator's fifth tweak,
    // 2026-09-04: "she wants people to see that pic, clearly"). 0 = the
    // passes run straight into each other.
    const still = Math.max(0, parseFloat(media.dataset.still || '0'));
    let unlockArmed = false;
    let onScreen = true;
    let seeking = false;
    let stopped = false;
    let resting = false;
    let v;
    const armUnlock = () => {
      if (unlockArmed) return;
      unlockArmed = true;
      const events = ['touchend', 'pointerup', 'keydown'];
      const retry = () => {
        events.forEach((t) => document.removeEventListener(t, retry, true));
        unlockArmed = false;
        if (v && onScreen && !stopped && !seeking && !resting && v.paused) v.play().catch(() => {});
      };
      events.forEach((t) => document.addEventListener(t, retry, { capture: true, passive: true }));
    };
    const attach = () => {
      v = document.createElement('video');
      v.className = 'nc-hero__film';
      v.muted = true;
      v.loop = !ranges.length;
      v.preload = 'auto';
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('aria-label', media.dataset.label || '');
      v.defaultPlaybackRate = v.playbackRate = rate;
      v.addEventListener('loadedmetadata', () => { v.playbackRate = rate; });
      v.addEventListener('play', () => { v.playbackRate = rate; });
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
      media.append(v);
      if (ranges.length) {
        // The freeze frame: a canvas wearing the film's class (absolute,
        // cover) above the player; painted with the passage's last frame
        // at each join, then dissolved away.
        const c = document.createElement('canvas');
        c.className = 'nc-hero__film nc-hero__freeze';
        c.setAttribute('aria-hidden', 'true');
        gsap.set(c, { opacity: 0 });
        media.append(c);
        const cx = c.getContext('2d');
        let ri = 0;
        let passes = 0;
        let joining = false;
        v.addEventListener('seeked', () => { seeking = false; });
        v.addEventListener('loadedmetadata', () => { seeking = true; v.currentTime = ranges[0][0]; }, { once: true });
        // The portrait beat: the reel dissolves out to the still beneath
        // (1.2s), rests `still` seconds, and dissolves back in (1.6s) at
        // the first passage. With data-plays set, the last pass ends
        // here and stays — the film ends where it began.
        const freeze = () => {
          // The last in-window frame onto the canvas, the player paused:
          // nothing past the window can show. Returns whether it drew.
          if (!(v.videoWidth && v.readyState >= 2)) { v.pause(); return false; }
          try {
            if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
            cx.drawImage(v, 0, 0, c.width, c.height);
            v.pause();
            gsap.set(c, { opacity: 1 });
            return true;
          } catch (e) { v.pause(); return false; }
        };
        const rest = () => {
          resting = true;
          const frozen = freeze();
          // The still beneath appears as the frozen frame (or the paused
          // player, if the draw failed) dissolves away.
          const layer = frozen ? c : v;
          if (frozen) gsap.set(v, { opacity: 0 });
          gsap.to(layer, {
            opacity: 0,
            duration: xfade > 0 ? 1.2 : 0,
            ease: 'power2.inOut',
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(v, { opacity: 0 });
              gsap.set(c, { opacity: 0 });
              if (stopped) return;
              ri = 0;
              seeking = true;
              v.currentTime = ranges[0][0];
              setTimeout(() => {
                const go = () => {
                  resting = false;
                  if (onScreen) v.play().catch(armUnlock);
                  gsap.to(v, { opacity: 1, duration: xfade > 0 ? 1.6 : 0, ease: 'power2.out', overwrite: 'auto', onComplete: () => { joining = false; } });
                };
                if (seeking) v.addEventListener('seeked', go, { once: true });
                else go();
              }, still * 1000);
            },
          });
        };
        const join = () => {
          if (joining || stopped) return;
          joining = true;
          const next = (ri + 1) % ranges.length;
          if (next === 0) {
            passes += 1;
            if (plays && passes >= plays) stopped = true;
            if (still > 0 || stopped) { rest(); return; }
          }
          // Freeze FIRST: the last in-window frame goes on the canvas and
          // the player pauses — nothing past the window can show.
          let frozen = false;
          if (v.videoWidth && v.readyState >= 2) {
            try {
              if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
              cx.drawImage(v, 0, 0, c.width, c.height);
              frozen = true;
            } catch (e) { frozen = false; }
          }
          v.pause();
          if (frozen) gsap.set(c, { opacity: 1 });
          ri = next;
          seeking = true;
          v.currentTime = ranges[ri][0];
          const go = () => {
            if (onScreen && !stopped) v.play().catch(armUnlock);
            if (frozen && xfade > 0) {
              gsap.to(c, { opacity: 0, duration: xfade, ease: 'power1.inOut', overwrite: 'auto', onComplete: () => { joining = false; } });
            } else {
              gsap.set(c, { opacity: 0 });
              joining = false;
            }
          };
          v.addEventListener('seeked', go, { once: true });
        };
        // Three clocks watch the window's end (a frame callback alone can
        // lag in a background tab): the video-frame callback, timeupdate,
        // and a 40ms interval — the margin is one 0.5× frame.
        const tick = () => {
          if (stopped || joining || seeking) return;
          if (v.currentTime >= ranges[ri][1] - 0.05) join();
        };
        if ('requestVideoFrameCallback' in v) {
          const onFrame = () => { tick(); if (!stopped) v.requestVideoFrameCallback(onFrame); };
          v.requestVideoFrameCallback(onFrame);
        }
        v.addEventListener('timeupdate', tick);
        setInterval(tick, 40);
        v.addEventListener('ended', () => { if (!joining) join(); });
      }
      // The fade-in rides the first `playing` event, so a play() that
      // was refused and later unlocked by a gesture still fades in.
      v.addEventListener(
        'playing',
        () => gsap.to(v, { opacity: 1, duration: 1.6, ease: 'power2.out', overwrite: 'auto' }),
        { once: true },
      );
      v.addEventListener('canplay', () => { v.play().catch(armUnlock); }, { once: true });
      new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            onScreen = e.isIntersecting;
            if (onScreen) {
              if (!stopped && !seeking && !resting && v.paused) v.play().catch(armUnlock);
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

  if (!reduced) {
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

  } // end of choreography 3–8

  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
