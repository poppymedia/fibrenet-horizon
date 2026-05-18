import { ThemeEvents } from '@theme/events';

/**
 * Fibrenet product stock region — lead time, quantity, untracked in-stock rules.
 * Prefers server-rendered markup from the section response; falls back to variant JSON.
 */
class FibrenetProductStock extends HTMLElement {
  /** @type {Record<string, { quantity: number, managed: boolean, available: boolean }>} */
  #variants = {};

  /** @type {AbortController | undefined} */
  #abortController;

  /** @type {(event: Event) => void} */
  #onVariantUpdateBound = (event) => this.#onVariantUpdate(event);

  connectedCallback() {
    this.#reloadVariantsFromDom();

    this.#abortController?.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    document.addEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdateBound, { signal });

    const section = this.closest('.shopify-section');
    const productInformation = this.closest('.product-information');
    const picker = productInformation?.querySelector('variant-picker');

    section?.addEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdateBound, { signal });
    productInformation?.addEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdateBound, { signal });
    picker?.addEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdateBound, { signal });
  }

  disconnectedCallback() {
    this.#abortController?.abort();
    this.#abortController = undefined;
  }

  #reloadVariantsFromDom() {
    const dataEl = this.querySelector('[data-fibrenet-stock-variants]');
    if (!dataEl?.textContent) return;

    try {
      this.#variants = JSON.parse(dataEl.textContent);
    } catch {
      this.#variants = {};
    }
  }

  /** @param {Event} event */
  #onVariantUpdate(event) {
    if (!(event instanceof CustomEvent) || !event.detail) return;

    const mySection = this.closest('.shopify-section');
    const eventSection =
      event.target instanceof Element ? event.target.closest('.shopify-section') : null;

    if (mySection && eventSection && mySection !== eventSection) {
      return;
    }

    const { data, resource } = event.detail;

    if (data?.newProduct) {
      this.dataset.productId = data.newProduct.id;
    } else if (data?.productId && this.dataset.productId && String(data.productId) !== this.dataset.productId) {
      return;
    }

    this.#syncLeadTimeFromHtml(data?.html);

    if (this.#syncFromHtml(data?.html)) {
      this.#applyStockProtect(resource, event);
      return;
    }

    const variant = resource;
    if (!variant?.id) return;

    this.#reloadVariantsFromDom();

    const id = String(variant.id);
    const inventory = this.#variants[id] || {
      quantity: variant.inventory_quantity ?? 0,
      managed: variant.inventory_management === 'shopify',
      available: variant.available,
    };

    const leadTime = this.dataset.leadTime || '';
    const textEl = this.querySelector('[data-fibrenet-stock-text]');
    if (!textEl) return;

    textEl.innerHTML = this.#buildMessage(inventory, leadTime);
    this.#applyStockProtect(variant, event);
  }

  /**
   * @param {Document | undefined} html
   */
  #syncLeadTimeFromHtml(html) {
    if (!html) return;

    const productId = this.dataset.productId;
    const newStock = html.querySelector(
      productId
        ? `fibrenet-product-stock[data-product-id="${productId}"]`
        : 'fibrenet-product-stock'
    );

    if (newStock?.dataset.leadTime !== undefined) {
      this.dataset.leadTime = newStock.dataset.leadTime;
    }
  }

  /**
   * @param {Document | undefined} html
   * @returns {boolean}
   */
  #syncFromHtml(html) {
    if (!html) return false;

    const productId = this.dataset.productId;
    const newStock = html.querySelector(
      productId
        ? `fibrenet-product-stock[data-product-id="${productId}"]`
        : 'fibrenet-product-stock'
    );

    if (!newStock) return false;

    const newText = newStock.querySelector('[data-fibrenet-stock-text]');
    const textEl = this.querySelector('[data-fibrenet-stock-text]');

    if (!newText || !textEl) return false;

    textEl.innerHTML = newText.innerHTML;

    const newVariantsScript = newStock.querySelector('[data-fibrenet-stock-variants]');
    if (newVariantsScript?.textContent) {
      try {
        this.#variants = JSON.parse(newVariantsScript.textContent);
      } catch {
        /* keep existing map */
      }
    }

    return true;
  }

  /**
   * @param {{ id?: number | string, inventory_quantity?: number, inventory_management?: string, available?: boolean } | undefined} variant
   * @param {CustomEvent} event
   */
  #applyStockProtect(variant, event) {
    if (this.dataset.stockProtect !== 'true' || !variant?.id) return;

    const id = String(variant.id);
    const inventory = this.#variants[id];
    const quantity = inventory?.quantity ?? variant.inventory_quantity ?? 0;
    const managed = inventory?.managed ?? variant.inventory_management === 'shopify';

    if (managed && quantity > 0) {
      this.#protectPurchasability(event);
    }
  }

  /**
   * @param {{ quantity: number, managed: boolean, available: boolean }} inventory
   * @param {string} leadTime
   */
  #buildMessage(inventory, leadTime) {
    const inStockLabel = this.dataset.inStockLabel || 'In stock';
    const leadTimeLabel = this.dataset.leadTimeLabel || 'Lead time is ';
    const soldOutHtml = this.dataset.soldOutHtml || 'Sold Out (1 week lead time from order)';
    const stockTemplate = this.dataset.stockLabelTemplate || '<strong>__COUNT__</strong> in stock';

    if (leadTime) {
      return `${leadTimeLabel}<strong>${this.#escapeHtml(leadTime)}</strong>`;
    }

    if (inventory.managed) {
      if (inventory.quantity > 0) {
        return stockTemplate.replace('__COUNT__', String(inventory.quantity));
      }
      return soldOutHtml;
    }

    return inStockLabel;
  }

  /** @param {CustomEvent} event */
  #protectPurchasability(event) {
    requestAnimationFrame(() => {
      const section = this.closest('.shopify-section');
      const form = section?.querySelector('product-form-component');
      const addButton = form?.querySelector('[name="add"]');
      if (addButton instanceof HTMLButtonElement) {
        addButton.disabled = false;
        addButton.removeAttribute('aria-disabled');
      }
      const idInput = form?.querySelector('[name="id"]');
      if (idInput instanceof HTMLInputElement && event.detail?.resource?.id) {
        idInput.value = String(event.detail.resource.id);
      }
    });
  }

  /** @param {string} text */
  #escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

if (!customElements.get('fibrenet-product-stock')) {
  customElements.define('fibrenet-product-stock', FibrenetProductStock);
}
