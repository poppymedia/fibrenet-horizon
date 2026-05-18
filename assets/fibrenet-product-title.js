import { ThemeEvents } from '@theme/events';

/**
 * Fibrenet composite product H1 — syncs with variant:update and section morph.
 * Prefers copying server-rendered markup from the section response; falls back to variant JSON.
 *
 * title_mode: cables | public_sku | cwdm | aocdac
 */
class FibrenetProductTitle extends HTMLElement {
  /** @type {Record<string, unknown>} */
  #config = {};

  /** @type {AbortController | undefined} */
  #abortController;

  /** @type {(event: Event) => void} */
  #onVariantUpdateBound = (event) => this.#onVariantUpdate(event);

  connectedCallback() {
    const configEl = this.querySelector('[data-fibrenet-title-config]');
    if (configEl?.textContent) {
      try {
        this.#config = JSON.parse(configEl.textContent);
      } catch {
        this.#config = {};
      }
    }

    this.#abortController?.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    // Document listener survives section morph and picker replacement.
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

    // Section Rendering API path: title is morphed from Liquid; copy from response when present.
    if (this.#syncFromHtml(data?.html)) {
      return;
    }

    const picker = this.closest('.product-information')?.querySelector('variant-picker');
    const variant =
      resource || this.#getVariantFromHtml(data?.html) || this.#getVariantFromPicker(picker);

    if (variant) {
      this.#updateFromVariant(variant, picker);
    }
  }

  /**
   * @param {Document | undefined} html
   * @returns {boolean}
   */
  #syncFromHtml(html) {
    if (!html) return false;

    const productId = this.dataset.productId;
    const newTitle = html.querySelector(
      productId
        ? `fibrenet-product-title[data-product-id="${productId}"]`
        : 'fibrenet-product-title'
    );

    if (!newTitle) return false;

    const newHeading = newTitle.querySelector('.fibrenet-product-title__heading');
    const heading = this.querySelector('.fibrenet-product-title__heading');

    if (!newHeading || !heading) return false;

    heading.innerHTML = newHeading.innerHTML;

    const newSkuPart = newTitle.querySelector('#sku_part');
    const skuPart = this.querySelector('#sku_part');

    if (newSkuPart && skuPart) {
      skuPart.innerHTML = newSkuPart.innerHTML;
    } else if (!newSkuPart && skuPart) {
      skuPart.remove();
    }

    return true;
  }

  /**
   * @param {Document | undefined} html
   * @returns {Record<string, unknown> | null}
   */
  #getVariantFromHtml(html) {
    if (!html) return null;

    const productId = this.dataset.productId;
    const pickers = html.querySelectorAll('variant-picker');

    for (const picker of pickers) {
      if (productId && picker instanceof HTMLElement && picker.dataset.productId !== productId) {
        continue;
      }

      const script = picker.querySelector('script[type="application/json"]');
      if (!script?.textContent) continue;

      try {
        return JSON.parse(script.textContent);
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * @param {Element | null | undefined} picker
   * @returns {Record<string, unknown> | null}
   */
  #getVariantFromPicker(picker) {
    if (!(picker instanceof HTMLElement)) return null;

    const script = picker.querySelector('script[type="application/json"]');
    if (!script?.textContent) return null;

    try {
      return JSON.parse(script.textContent);
    } catch {
      return null;
    }
  }

  /**
   * @param {Element | null | undefined} picker
   * @returns {string}
   */
  #getSelectedOptionLabel(picker) {
    if (!(picker instanceof HTMLElement)) return '';

    const parts = [];

    picker.querySelectorAll('fieldset').forEach((fieldset) => {
      const checked = fieldset.querySelector('input:checked');
      if (!(checked instanceof HTMLInputElement)) return;

      const text = checked
        .closest('label')
        ?.querySelector('.variant-option__button-label__text')
        ?.textContent?.trim();

      parts.push(text || checked.value);
    });

    if (parts.length > 0) {
      return parts.join(' / ');
    }

    const select = picker.querySelector('select option[selected], select option:checked');
    if (select instanceof HTMLOptionElement) {
      return select.textContent?.trim() || select.value;
    }

    return '';
  }

  /**
   * @param {Record<string, unknown>} variant
   * @param {Element | null | undefined} picker
   */
  #updateFromVariant(variant, picker) {
    const titleMode = String(this.dataset.titleMode || this.#config.titleMode || 'public_sku');
    const productType = String(this.dataset.productType || this.#config.productType || '');
    const productTitleClean = String(this.dataset.productTitleClean || this.#config.productTitleClean || '');
    const publicSku = String(this.dataset.publicSku || this.#config.publicSku || '');
    const subtitlePrefix = String(this.dataset.subtitlePrefix || this.#config.subtitlePrefix || '');
    let baseSku = String(this.dataset.baseSku || this.#config.baseSku || '');

    if (productType.includes('Compatibles-')) {
      baseSku = productType.replace(/^Compatibles-/, '').trim();
    }
    if (publicSku) {
      baseSku = publicSku;
    }

    const variantLabel = String(variant.title || '');
    const pickerLabel = this.#getSelectedOptionLabel(picker);
    const optionCount = [variant.option1, variant.option2, variant.option3].filter(Boolean).length;

    let optionLabel = pickerLabel || String(variant.option1 || variantLabel);
    if (optionCount > 1 && variantLabel) {
      optionLabel = variantLabel;
    }
    if (pickerLabel) {
      optionLabel = pickerLabel;
    }

    const uncoded = optionLabel.toLowerCase().includes('uncoded');
    let displayLeadingSku = String(variant.sku || baseSku);
    let displayOptionSuffix = optionLabel;

    if (uncoded) {
      displayLeadingSku = baseSku;
      displayOptionSuffix = optionLabel.replace(/compatible/gi, '').trim();
    }

    let h1Leading = publicSku || baseSku;
    let h1Middle = productTitleClean;
    let h1Suffix = displayOptionSuffix;
    let h1Barcode = '';

    switch (titleMode) {
      case 'cables':
        h1Leading = displayLeadingSku;
        h1Middle = productTitleClean;
        h1Suffix = displayOptionSuffix;
        break;
      case 'cwdm':
        h1Leading = publicSku || baseSku;
        h1Middle = subtitlePrefix || productTitleClean;
        h1Suffix = displayOptionSuffix;
        break;
      case 'aocdac':
        h1Leading = publicSku || baseSku;
        h1Middle = productTitleClean;
        h1Suffix = displayOptionSuffix;
        h1Barcode = String(variant.barcode || '');
        break;
      default:
        h1Leading = publicSku || baseSku;
        h1Middle = productTitleClean;
        h1Suffix = displayOptionSuffix;
    }

    if (!h1Leading && baseSku) {
      h1Leading = baseSku;
    }

    this.#ensureSegment('leading');
    this.#ensureSegment('middle');
    this.#ensureSegment('suffix');
    if (titleMode === 'aocdac') {
      this.#ensureSegment('barcode');
    }

    this.#setSegment('leading', h1Leading);
    this.#setSegment('middle', h1Middle);
    this.#setSegment('suffix', h1Suffix);
    this.#setSegment('barcode', titleMode === 'aocdac' ? h1Barcode : '');

    const skuPart = this.querySelector('#sku_part');
    if (skuPart) {
      const skuEl = skuPart.querySelector('.sku');
      const variantEl = skuPart.querySelector('.variant');
      if (skuEl) skuEl.textContent = baseSku;
      if (variantEl) variantEl.textContent = variantLabel;
    }
  }

  /**
   * @param {string} key
   */
  #ensureSegment(key) {
    if (this.querySelector(`[data-fibrenet-title="${key}"]`)) return;

    const heading = this.querySelector('.fibrenet-product-title__heading');
    if (!heading) return;

    const span = document.createElement('span');
    span.dataset.fibrenetTitle = key;
    span.className = `fibrenet-product-title__${key}`;
    heading.appendChild(span);
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  #setSegment(key, value) {
    const el = this.querySelector(`[data-fibrenet-title="${key}"]`);
    if (!el) return;
    const text = value ? String(value).trim() : '';
    el.textContent = text;
    if (text) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }
}

if (!customElements.get('fibrenet-product-title')) {
  customElements.define('fibrenet-product-title', FibrenetProductTitle);
}
