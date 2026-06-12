import { Component } from '@theme/component';
import { ThemeEvents, VariantUpdateEvent, ZoomMediaSelectedEvent } from '@theme/events';

/**
 * A custom element that renders a media gallery.
 *
 * @typedef {object} Refs
 * @property {import('./zoom-dialog').ZoomDialog} [zoomDialogComponent] - The zoom dialog component.
 * @property {import('./slideshow').Slideshow} [slideshow] - The slideshow component.
 * @property {HTMLElement[]} [media] - The media elements.
 *
 * @extends Component<Refs>
 */
export class MediaGallery extends Component {
  connectedCallback() {
    super.connectedCallback();

    const { signal } = this.#controller;
    const target = this.closest('.shopify-section, dialog');

    target?.addEventListener(ThemeEvents.variantUpdate, this.#handleVariantUpdate, { signal });
    this.refs.zoomDialogComponent?.addEventListener(ThemeEvents.zoomMediaSelected, this.#handleZoomMediaSelected, {
      signal,
    });
  }

  #controller = new AbortController();

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#controller.abort();
  }

  /**
   * Handles a variant update event by replacing the current media gallery with a new one.
   *
   * @param {VariantUpdateEvent} event - The variant update event.
   */
  #handleVariantUpdate = (event) => {
    if (!(event instanceof VariantUpdateEvent)) return;

    const source = event.detail.data.html;
    if (!source) return;

    const variant = event.detail.resource;
    const sectionMorphed = event.detail.data.sectionMorphed === true;

    if (sectionMorphed) {
      this.selectVariantSlide(variant);
      return;
    }

    const newMediaGallery = source.querySelector('media-gallery');
    if (!newMediaGallery) return;

    this.replaceWith(newMediaGallery);

    if (newMediaGallery instanceof MediaGallery) {
      newMediaGallery.selectVariantSlide(variant);
    }
  };

  /**
   * Shows the slide for the selected variant's featured media (or slide 0).
   *
   * @param {VariantUpdateEvent['detail']['resource']} variant
   */
  selectVariantSlide(variant) {
    requestAnimationFrame(() => {
      const { slideshow } = this.refs;
      if (!slideshow) return;

      const featuredMediaId = variant?.featured_media?.id;
      if (featuredMediaId != null) {
        const slideId = String(featuredMediaId);
        const slides = slideshow.refs.slides ?? [];
        const hasSlideId = slides.some((slide) => slide.getAttribute('slide-id') === slideId);

        if (hasSlideId) {
          slideshow.select({ id: slideId }, undefined, { animate: false });
          return;
        }

        const index = slides.findIndex(
          (slide) => slide.querySelector(`[data-media-id="${featuredMediaId}"]`) != null
        );
        if (index >= 0) {
          slideshow.select(index, undefined, { animate: false });
          return;
        }
      }

      slideshow.select(0, undefined, { animate: false });
    });
  }

  /**
   * Handles the 'zoom-media:selected' event.
   * @param {ZoomMediaSelectedEvent} event - The zoom-media:selected event.
   */
  #handleZoomMediaSelected = async (event) => {
    this.slideshow?.select(event.detail.index, undefined, { animate: false });
  };

  /**
   * Zooms the media gallery.
   *
   * @param {number} index - The index of the media to zoom.
   * @param {PointerEvent} event - The pointer event.
   */
  zoom(index, event) {
    this.refs.zoomDialogComponent?.open(index, event);
  }

  get slideshow() {
    return this.refs.slideshow;
  }

  get media() {
    return this.refs.media;
  }

  get presentation() {
    return this.dataset.presentation;
  }
}

if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', MediaGallery);
}
