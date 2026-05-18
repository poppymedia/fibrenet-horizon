import { RecentlyViewed } from '@theme/recently-viewed-products';
import { sectionRenderer } from '@theme/section-renderer';

/**
 * Loads recently viewed products into the section via the Search API (same pattern as predictive search).
 */
class RecentlyViewedProducts extends HTMLElement {
  connectedCallback() {
    this.#load();
  }

  async #load() {
    const sectionId = this.dataset.sectionId;
    if (!sectionId) return;

    let viewedProducts = RecentlyViewed.getProducts();
    const currentId = this.dataset.currentProductId;

    if (currentId) {
      viewedProducts = viewedProducts.filter((id) => id !== currentId);
    }

    if (viewedProducts.length === 0) {
      this.setAttribute('hidden', '');
      return;
    }

    const url = new URL(Theme.routes.search_url, window.location.origin);
    url.searchParams.set('q', viewedProducts.map((id) => `id:${id}`).join(' OR '));
    url.searchParams.set('resources[type]', 'product');

    try {
      const sectionHTML = await sectionRenderer.getSectionHTML(sectionId, false, url);
      if (!sectionHTML) {
        this.setAttribute('hidden', '');
        return;
      }

      const parsed = new DOMParser().parseFromString(sectionHTML, 'text/html');
      const incoming = parsed.querySelector('[data-recently-viewed-content]');
      const target = this.querySelector('[data-recently-viewed-content]');

      if (!incoming || !target) {
        this.setAttribute('hidden', '');
        return;
      }

      if (!incoming.querySelector('.resource-list__item')) {
        this.setAttribute('hidden', '');
        return;
      }

      target.replaceWith(incoming);
      this.removeAttribute('hidden');
    } catch {
      this.setAttribute('hidden', '');
    }
  }
}

if (!customElements.get('recently-viewed-products')) {
  customElements.define('recently-viewed-products', RecentlyViewedProducts);
}
