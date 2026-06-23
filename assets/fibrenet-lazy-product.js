/**
 * Defers search, product-card, and slideshow scripts on product pages until after LCP.
 * Configured via window.FibrenetLazyProduct (see fibrenet-lazy-product-bootstrap.liquid).
 */

/** @type {{ mode?: string; warmupDelay?: number; idleDelay?: number; gallerySelector?: string; cardBundleUrls?: string[]; sectionScripts?: { selector: string; url: string }[] }} */
const config = window.FibrenetLazyProduct ?? {};

const state = {
  bundleLoaded: false,
  lcpScheduled: false,
  mounted: false,
  opening: false,
  /** @type {Promise<void> | null} */
  loadPromise: null,
};

/** @type {ReturnType<typeof setTimeout> | null} */
let warmupTimer = null;

/** @type {Set<string>} */
const loadedSectionScripts = new Set();

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
function startCardBundleLoad() {
  if (!state.loadPromise) {
    for (const url of config.cardBundleUrls ?? []) {
      injectModulePreload(url);
    }

    state.loadPromise = Promise.all((config.cardBundleUrls ?? []).map((url) => import(url))).then(() => {
      state.bundleLoaded = true;
    });
  }

  return state.loadPromise;
}

function scheduleIdleBundleLoad() {
  if (state.lcpScheduled) return;

  state.lcpScheduled = true;
  const idleDelay = config.idleDelay ?? 2500;

  const run = () => {
    startCardBundleLoad();
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: idleDelay + 1000 });
  } else {
    window.setTimeout(run, idleDelay);
  }
}

function scheduleAfterLcp() {
  let lcpHandled = false;

  const onLcp = () => {
    if (lcpHandled) return;
    lcpHandled = true;

    if (config.mode === 'click') {
      startCardBundleLoad();
      return;
    }

    scheduleIdleBundleLoad();
  };

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        if (list.getEntries().length > 0) {
          observer.disconnect();
          onLcp();
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      /* unsupported */
    }
  }

  window.setTimeout(onLcp, 4000);
}

function debouncedWarmup() {
  clearTimeout(warmupTimer);
  warmupTimer = window.setTimeout(() => startCardBundleLoad(), config.warmupDelay ?? 150);
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
    await startCardBundleLoad();
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
    trigger.addEventListener('touchstart', () => startCardBundleLoad(), { passive: true });
    trigger.addEventListener('focusin', () => startCardBundleLoad());
  }
}

function bindGallerySlideshow() {
  const selector = config.gallerySelector ?? 'media-gallery slideshow-component';
  const slideshow = document.querySelector(selector);

  if (!(slideshow instanceof HTMLElement)) return;

  const interactiveSelector = 'slideshow-arrows, slideshow-controls, [ref="previous"], [ref="next"]';

  slideshow.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(interactiveSelector)) {
        startCardBundleLoad();
      }
    },
    { capture: true }
  );
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
function loadSectionScript(url) {
  if (loadedSectionScripts.has(url)) {
    return Promise.resolve();
  }

  loadedSectionScripts.add(url);
  return import(url).then(() => {});
}

function bindBelowFoldSections() {
  for (const entry of config.sectionScripts ?? []) {
    const elements = document.querySelectorAll(entry.selector);

    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (!entries[0]?.isIntersecting) return;

          obs.disconnect();
          startCardBundleLoad().then(() => loadSectionScript(entry.url));
        },
        { rootMargin: '0px 0px 400px 0px' }
      );

      observer.observe(element);
    }
  }
}

function init() {
  scheduleAfterLcp();
  bindSearchTriggers();
  bindGallerySlideshow();
  bindBelowFoldSections();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
