/**
 * Defers search modal scripts on content pages until user interaction.
 * Configured via window.FibrenetLazySearch (see fibrenet-lazy-search-bootstrap.liquid).
 */

/** @type {{ mode?: string; warmupDelay?: number; importUrls?: string[]; moduleUrls?: string[] }} */
const config = window.FibrenetLazySearch ?? {};

const state = {
  warmed: false,
  mounted: false,
  opening: false,
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

function warmupSearch() {
  if (state.warmed) return;

  state.warmed = true;
  startLoad();
}

function debouncedWarmup() {
  clearTimeout(warmupTimer);
  warmupTimer = setTimeout(warmupSearch, config.warmupDelay ?? 150);
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

function bindTriggers() {
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
    trigger.addEventListener('touchstart', warmupSearch, { passive: true });
    trigger.addEventListener('focusin', warmupSearch);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindTriggers);
} else {
  bindTriggers();
}
