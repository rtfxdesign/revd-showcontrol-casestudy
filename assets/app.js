/* REVd case study — progressive enhancement only.
   With JS off: hero video still autoplays via the attribute, gallery clips
   show their posters, and lightbox triggers simply do nothing visible. */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------- hero playback */

  const heroVideo = $('.hero__video');
  const heroBtn = $('#hero-mute');

  if (heroVideo && heroBtn) {
    heroBtn.hidden = false;

    // Respect reduced-motion: don't loop a moving backdrop unasked.
    if (calm.matches) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    }

    const syncHero = () => {
      const paused = heroVideo.paused;
      heroBtn.toggleAttribute('data-paused', paused);
      heroBtn.querySelector('.visually-hidden').textContent =
        paused ? 'Play background video' : 'Pause background video';
    };

    heroBtn.addEventListener('click', () => {
      if (heroVideo.paused) heroVideo.play().catch(() => {});
      else heroVideo.pause();
    });

    heroVideo.addEventListener('play', syncHero);
    heroVideo.addEventListener('pause', syncHero);
    syncHero();
  }

  /* ------------------------------------------------------- gallery clips */

  const clips = $$('.clip');

  const stopOthers = (keep) => {
    for (const fig of clips) {
      const v = fig.querySelector('video');
      if (v && v !== keep && !v.paused) v.pause();
    }
  };

  for (const fig of clips) {
    const video = fig.querySelector('video');
    const btn = fig.querySelector('[data-play]');
    if (!video || !btn) continue;

    btn.addEventListener('click', () => {
      if (video.paused) {
        stopOthers(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => fig.setAttribute('data-playing', ''));
    video.addEventListener('pause', () => fig.removeAttribute('data-playing'));
  }

  // Pause any clip that scrolls out of view — no point decoding off-screen.
  if ('IntersectionObserver' in window) {
    const offscreen = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) {
          const v = e.target.querySelector('video');
          if (v && !v.paused) v.pause();
        }
      }
    }, { threshold: 0 });
    clips.forEach((c) => offscreen.observe(c));
  }

  /* ------------------------------------------------------------ lightbox */

  const dialog = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCap = $('#lightbox-cap');
  let opener = null;

  for (const btn of $$('[data-zoom]')) {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      opener = btn;
      lbImg.src = btn.dataset.zoom;
      lbImg.alt = img ? img.alt : '';
      lbCap.textContent = btn.dataset.caption || '';
      dialog.showModal();
    });
  }

  // Native <dialog> handles Esc and, with closedby="any", backdrop dismissal.
  // Clicking the backdrop is still wired manually for engines without it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    lbImg.removeAttribute('src');
    if (opener) { opener.focus(); opener = null; }
  });

  /* -------------------------------------------------------------- reveal */

  if (!calm.matches && 'IntersectionObserver' in window) {
    const targets = $$('.band > .wrap > *');
    targets.forEach((el) => el.classList.add('reveal'));

    const shower = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute('data-shown', '');
        obs.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    targets.forEach((el) => shower.observe(el));
  }
})();
