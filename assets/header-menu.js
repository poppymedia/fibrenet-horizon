import { Component } from '@theme/component';
import { debounce, onDocumentLoaded } from '@theme/utilities';
import { MegaMenuHoverEvent } from '@theme/events';

const ACTIVATE_DELAY = 0;
const DEFAULT_DEACTIVATE_DELAY = 350;

/**
 * A custom element that manages a header menu.
 *
 * @typedef {Object} State
 * @property {HTMLElement | null} activeItem - The currently active menu item.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} overflowMenu - The overflow menu.
 * @property {HTMLElement[]} [submenu] - The submenu in each respective menu item.
 *
 * @extends {Component<Refs>}
 */
class HeaderMenu extends Component {
  requiredRefs = ['overflowMenu'];

  #abortController = new AbortController();
  /** @type {ReturnType<typeof debounce<(item?: HTMLElement | null) => void>> | undefined} */
  #debouncedDeactivate;

  connectedCallback() {
    super.connectedCallback();

    this.#debouncedDeactivate = debounce(this.#deactivate, this.#deactivateDelay);

    this.addEventListener('click', this.#toggleThirdLevel, {
      signal: this.#abortController.signal,
    });
    if (this.dataset.thirdLevelLayout === 'full_width') {
      this.refs.submenu?.forEach((submenu) => {
        submenu.addEventListener(
          'pointerenter',
          () => this.#debouncedDeactivate?.cancel(),
          { signal: this.#abortController.signal }
        );
        submenu.addEventListener(
          'pointerleave',
          () => this.#debouncedDeactivate?.(),
          { signal: this.#abortController.signal }
        );
      });
    }
    window.addEventListener('resize', this.#positionOpenFlyouts, {
      signal: this.#abortController.signal,
    });
    window.addEventListener('resize', this.#balanceFullWidthMenus, {
      signal: this.#abortController.signal,
    });
    window.addEventListener('resize', this.#updateFullWidthMenuTop, {
      signal: this.#abortController.signal,
    });
    window.addEventListener('scroll', this.#positionOpenFlyouts, {
      capture: true,
      signal: this.#abortController.signal,
    });
    window.addEventListener('scroll', this.#updateFullWidthMenuTop, {
      capture: true,
      signal: this.#abortController.signal,
    });

    this.overflowMenu?.addEventListener('pointerleave', () => this.#debouncedDeactivate(), {
      signal: this.#abortController.signal,
    });

    onDocumentLoaded(this.#preloadImages);
    requestAnimationFrame(this.#balanceFullWidthMenus);
    this.#updateFullWidthMenuTop();
  }

  get #isFibrenetMenu() {
    return this.dataset.menuMode === 'fibrenet';
  }

  get #deactivateDelay() {
    if (this.#isFibrenetMenu && this.dataset.thirdLevelLayout === 'full_width') {
      return 150;
    }

    return this.#isFibrenetMenu ? 0 : DEFAULT_DEACTIVATE_DELAY;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  /**
   * @type {State}
   */
  #state = {
    activeItem: null,
  };

  /**
   * Time to allow for a closing animation between initiating a deactivation and actually deactivating the active item.
   * @returns {number}
   */
  get animationDelay() {
    const value = this.dataset.animationDelay;
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Get the overflow menu
   */
  get overflowMenu() {
    return /** @type {HTMLElement | null} */ (this.refs.overflowMenu?.shadowRoot?.querySelector('[part="overflow"]'));
  }

  /**
   * Whether the overflow menu is hovered
   * @returns {boolean}
   */
  get overflowHovered() {
    return this.refs.overflowMenu?.matches(':hover') ?? false;
  }

  /**
   * Activate the selected menu item immediately
   * @param {PointerEvent | FocusEvent} event
   */
  activate = (event) => {
    this.#debouncedDeactivate?.cancel();
    this.#debouncedActivateHandler.cancel();

    this.#debouncedActivateHandler(event);
  };

  /**
   * Activate the selected menu item with a delay
   * @param {PointerEvent | FocusEvent} event
   */
  #activateHandler = (event) => {
    this.#debouncedDeactivate?.cancel();

    this.dispatchEvent(new MegaMenuHoverEvent());
    this.#updateFullWidthMenuTop();

    this.removeAttribute('data-animating');

    if (!(event.target instanceof Element)) return;

    let item = findMenuItem(event.target);

    if (!item || item == this.#state.activeItem) return;

    const isDefaultSlot = event.target.slot === '';

    this.dataset.overflowExpanded = (!isDefaultSlot).toString();

    const previouslyActiveItem = this.#state.activeItem;

    if (previouslyActiveItem) {
      previouslyActiveItem.ariaExpanded = 'false';
    }

    this.#state.activeItem = item;
    this.ariaExpanded = 'true';
    item.ariaExpanded = 'true';

    let submenu = findSubmenu(item);
    let overflowMenuHeight = this.overflowMenu?.offsetHeight ?? 0;

    if (!submenu && !isDefaultSlot) {
      submenu = this.overflowMenu;
    }

    if (!this.#isFibrenetMenu) {
      const submenuHeight = submenu ? Math.max(submenu.offsetHeight, overflowMenuHeight) : 0;

      this.style.setProperty('--submenu-height', `${submenuHeight}px`);
      this.style.setProperty('--submenu-opacity', '1');
    }
  };

  #debouncedActivateHandler = debounce(this.#activateHandler, ACTIVATE_DELAY);

  /**
   * Deactivate the active item after a delay
   * @param {PointerEvent | FocusEvent} event
   */
  deactivate(event) {
    this.#debouncedActivateHandler.cancel();

    if (!(event.target instanceof Element)) return;

    const item = findMenuItem(event.target);

    // Make sure the item to be deactivated is still the active one. Ideally
    // we cancelled the debounce before the item was changed, but just in case.
    if (item === this.#state.activeItem) {
      this.#debouncedDeactivate?.();
    }
  }

  /**
   * Deactivate the active item immediately
   * @param {HTMLElement | null} [item]
   */
  #deactivate = (item = this.#state.activeItem) => {
    if (!item || item != this.#state.activeItem) return;
    if (this.overflowHovered) return;

    const submenu = findSubmenu(item);
    if (
      this.#isFibrenetMenu &&
      this.dataset.thirdLevelLayout === 'full_width' &&
      submenu?.matches(':hover')
    ) {
      return;
    }

    this.dataset.overflowExpanded = 'false';
    this.#state.activeItem = null;
    this.ariaExpanded = 'false';
    item.ariaExpanded = 'false';

    if (this.#isFibrenetMenu) {
      this.style.removeProperty('--submenu-height');
      this.style.removeProperty('--submenu-opacity');
      return;
    }

    this.style.setProperty('--submenu-height', '0px');
    this.style.setProperty('--submenu-opacity', '0');
    item.setAttribute('data-animating', '');

    setTimeout(() => {
      item.removeAttribute('data-animating');
    }, Math.max(0, this.animationDelay - 150)); // Start header transition 150ms before submenu finishes
  };

  #toggleThirdLevel = (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('button[data-third-level-toggle]');
    if (!(button instanceof HTMLButtonElement) || !this.contains(button)) return;

    const panel = button.closest('.submenu__item')?.querySelector('.submenu__third-level-list');
    if (!(panel instanceof HTMLElement)) return;

    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;

    if (!expanded && panel.matches('.submenu__third-level-list--flyout')) {
      this.#positionFlyout(button, panel);
    } else if (expanded) {
      panel.style.removeProperty('--submenu-flyout-left');
      panel.style.removeProperty('--submenu-flyout-top');
    }
  };

  #positionOpenFlyouts = () => {
    this.querySelectorAll('.submenu__third-level-list--flyout:not([hidden])').forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return;
      const button = panel.closest('.submenu__item')?.querySelector('button[data-third-level-toggle]');
      if (button instanceof HTMLButtonElement) this.#positionFlyout(button, panel);
    });
  };

  #updateFullWidthMenuTop = () => {
    if (this.dataset.thirdLevelLayout !== 'full_width') return;

    const header = document.querySelector('#header-component');
    if (!(header instanceof HTMLElement)) return;

    this.style.setProperty(
      '--submenu-full-width-top',
      `${header.getBoundingClientRect().bottom}px`
    );
  };

  #balanceFullWidthMenus = () => {
    if (this.dataset.balanceThirdLevelColumns !== 'true') return;

    this.querySelectorAll('.submenu--third-level-full-width').forEach((menu) => {
      if (!(menu instanceof HTMLElement)) return;

      const groups = Array.from(
        menu.querySelectorAll(':scope > .submenu__third-level-column > .submenu__item--column, :scope > .submenu__item--column')
      );
      if (groups.length < 2) return;

      const styles = getComputedStyle(menu);
      const horizontalPadding =
        parseFloat(styles.paddingInlineStart) + parseFloat(styles.paddingInlineEnd);
      const availableWidth = menu.clientWidth - horizontalPadding;
      const gap = parseFloat(styles.columnGap) || 32;
      const minimumColumnWidth = 224;
      const columnCount = Math.min(
        groups.length,
        Math.max(1, Math.floor((availableWidth + gap) / (minimumColumnWidth + gap)))
      );
      const columnWidth = Math.max(0, (availableWidth - gap * (columnCount - 1)) / columnCount);

      const measure = document.createElement('div');
      measure.className = 'submenu submenu--third-level-full-width submenu--third-level-measure';
      measure.style.width = `${columnWidth + horizontalPadding}px`;
      menu.append(measure);

      const measuredGroups = groups.map((element, index) => {
        const clone = element.cloneNode(true);
        measure.append(clone);
        return {
          element,
          index,
          height: clone.getBoundingClientRect().height,
        };
      });
      measure.remove();

      const columns = Array.from({ length: columnCount }, () => ({
        height: 0,
        groups: [],
      }));

      measuredGroups
        .sort((a, b) => b.height - a.height || a.index - b.index)
        .forEach((group) => {
          const column = columns.reduce((shortest, candidate) =>
            candidate.height < shortest.height ? candidate : shortest
          );
          column.groups.push(group);
          column.height += group.height;
        });

      menu.replaceChildren();
      menu.classList.add('submenu--third-level-balanced');
      menu.style.setProperty('--submenu-column-count', columnCount);

      columns.forEach(({ groups: columnGroups }) => {
        const column = document.createElement('div');
        column.className = 'submenu__third-level-column';
        columnGroups
          .sort((a, b) => a.index - b.index)
          .forEach(({ element }) => column.append(element));
        menu.append(column);
      });
    });
  };

  #positionFlyout(button, panel) {
    const dropdown = button.closest('.menu-list__submenu--compact');
    if (!(dropdown instanceof HTMLElement)) return;

    const itemRect = button.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const panelWidth = panel.getBoundingClientRect().width;
    const left = dropdownRect.right + panelWidth <= window.innerWidth
      ? dropdownRect.right
      : Math.max(0, dropdownRect.left - panelWidth);

    panel.style.setProperty('--submenu-flyout-left', `${left}px`);
    panel.style.setProperty('--submenu-flyout-top', `${itemRect.top}px`);
  }

  /**
   * Preload images that are set to load lazily.
   */
  #preloadImages = () => {
    const images = this.querySelectorAll('img[loading="lazy"]');
    images?.forEach((image) => image.removeAttribute('loading'));
  };
}

if (!customElements.get('header-menu')) {
  customElements.define('header-menu', HeaderMenu);
}

/**
 * Find the closest menu item.
 * @param {Element | null | undefined} element
 * @returns {HTMLElement | null}
 */
function findMenuItem(element) {
  if (!(element instanceof Element)) return null;

  if (element?.matches('[slot="more"')) {
    // Select the first overflowing menu item when hovering over the "More" item
    return findMenuItem(element.parentElement?.querySelector('[slot="overflow"]'));
  }

  return element?.querySelector('[ref="menuitem"]');
}

/**
 * Find the closest submenu.
 * @param {Element | null | undefined} element
 * @returns {HTMLElement | null}
 */
function findSubmenu(element) {
  const submenu = element?.parentElement?.querySelector('[ref="submenu[]"]');
  return submenu instanceof HTMLElement ? submenu : null;
}
