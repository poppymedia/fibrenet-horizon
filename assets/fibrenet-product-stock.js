import { ThemeEvents } from '@theme/events';

/**
 * Fibrenet product stock region — lead time, quantity, untracked in-stock rules.
 */
class FibrenetProductStock extends HTMLElement {
  /** @type {Record<string, { quantity: number, managed: boolean, available: boolean }>} */
  #variants = {};

  connectedCallback() {
    const dataEl = this.querySelector('[data-fibrenet-stock-variants]');
    if (dataEl?.textContent) {
      try {
        this.#variants = JSON.parse(dataEl.textContent);
      } catch {
        this.#variants = {};
      }
    }

    const section = this.closest('.shopify-section');
    section?.addEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdate);
  }

  disconnectedCallback() {
    const section = this.closest('.shopify-section');
    section?.removeEventListener(ThemeEvents.variantUpdate, this.#onVariantUpdate);
  }

  /** @param {CustomEvent} event */
  #onVariantUpdate = (event) => {
    const variant = event.detail?.resource;
    if (!variant?.id) return;

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

    if (this.dataset.stockProtect === 'true' && inventory.managed && inventory.quantity > 0) {
      this.#protectPurchasability(event);
    }
  };

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
