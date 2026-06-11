/**
 * Defers homepage slideshow and search scripts until interaction or idle time.
 * Configured via window.FibrenetLazyHome (see fibrenet-lazy-home-bootstrap.liquid).
 */

/** @type {{ mode?: string; warmupDelay?: number; idleDelay?: number; slideshowSelector?: string; importUrls?: string[]; moduleUrls?: string[] }} */
const config = window.FibrenetLazyHome ?? {};

const state = {
  warmed: false,
  mounted: false,
  opening: false,
  slideshowWarmed: false,
  /** @type {Promise<void> | null} */
  loadPromise: null,
};

/** @type {ReturnType<typeof setTimeout> | null} */
let warmupTimer = null;

/**
 * @param {string} url
 */
function injectModulePreload(url) {
  if (document.querySelector(`link[rel="modulepreload"][href="${url}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = url;
  link.fetchPriority = 'low';
  document.head.appendChild(link);
}

/**
 * @returns {Promise<void>}
 */
function startLoad() {
  if (!state.loadPromise) {
    for (const url of config.moduleUrls ?? []) {
      injectModulePreload(url);
    }

    state.loadPromise = Promise.all((config.importUrls ?? []).map((url) => import(url))).then(() => {});
  }

  return state.loadPromise;
}

function preloadHeroSlideImages() {
  document.querySelectorAll('.hero-slideshow .slide__image').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;

    const src = img.currentSrc || img.src;
    if (!src) return;

    const loader = new Image();
    loader.src = src;
  });
}

function warmupScripts() {
  if (state.warmed) return;

  state.warmed = true;
  preloadHeroSlideImages();
  startLoad();
}

function debouncedWarmup() {
  clearTimeout(warmupTimer);
  warmupTimer = setTimeout(warmupScripts, config.warmupDelay ?? 150);
}

function warmupSlideshow() {
  if (state.slideshowWarmed) return;

  state.slideshowWarmed = true;
  warmupScripts();
}

function mountModal() {
  if (state.mounted) return;

  const template = document.getElementById('fibrenet-search-modal-template');
  const mount = document.getElementById('fibrenet-search-modal-mount');

  if (!(template instanceof HTMLTemplateElement) || !(mount instanceof HTMLElement)) return;

  mount.appendChild(template.content.cloneNode(true));
  state.mounted = true;
}

/**
 * @param {HTMLElement | null} trigger
 * @param {boolean} busy
 */
function setBusy(trigger, busy) {
  if (!trigger) return;

  trigger.setAttribute('aria-busy', busy ? 'true' : 'false');
}

/**
 * @param {HTMLElement} trigger
 */
async function openSearch(trigger) {
  if (state.opening) return;

  state.opening = true;
  setBusy(trigger, true);

  try {
    await startLoad();
    mountModal();

    await Promise.all([
      customElements.whenDefined('dialog-component'),
      customElements.whenDefined('predictive-search-component'),
    ]);

    const modal = document.getElementById('search-modal');

    if (modal && 'showDialog' in modal && typeof modal.showDialog === 'function') {
      modal.showDialog();
    }
  } finally {
    state.opening = false;
    setBusy(trigger, false);
  }
}

function bindSearchTriggers() {
  const triggers = document.querySelectorAll('[data-fibrenet-lazy-search]');
  const useIntent = config.mode === 'intent';

  for (const trigger of triggers) {
    if (!(trigger instanceof HTMLElement)) continue;

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openSearch(trigger);
    });

    if (!useIntent) continue;

    trigger.addEventListener('pointerenter', debouncedWarmup);
    trigger.addEventListener('touchstart', warmupScripts, { passive: true });
    trigger.addEventListener('focusin', warmupScripts);
  }
}

function bindSlideshowTriggers() {
  const selector = config.slideshowSelector ?? '.hero-slideshow slideshow-component';
  const slideshow = document.querySelector(selector);

  if (!(slideshow instanceof HTMLElement)) return;

  const useIntent = config.mode === 'intent';

  if (useIntent) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              debouncedWarmup();
              observer.disconnect();
              break;
            }
          }
        },
        { rootMargin: '0px 0px 200px 0px', threshold: 0 }
      );

      observer.observe(slideshow);
    }

    slideshow.addEventListener('pointerenter', debouncedWarmup);
    slideshow.addEventListener('touchstart', warmupSlideshow, { passive: true });
    slideshow.addEventListener('focusin', warmupSlideshow);

    const idleDelay = config.idleDelay ?? 2500;
    const scheduleIdleWarmup = () => {
      window.setTimeout(warmupSlideshow, idleDelay);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleIdleWarmup, { timeout: idleDelay + 1000 });
    } else {
      scheduleIdleWarmup();
    }
  }

  const interactiveSelector = 'slideshow-arrows, slideshow-controls, [ref="previous"], [ref="next"]';

  slideshow.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(interactiveSelector)) {
        warmupSlideshow();
      }
    },
    { capture: true }
  );
}

function init() {
  preloadHeroSlideImages();
  bindSearchTriggers();
  bindSlideshowTriggers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
