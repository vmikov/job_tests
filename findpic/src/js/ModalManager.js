import View from "./View";

export default class ModalManager {
  constructor(view, backdrop, modal, templateFunc) {
    this.view = view;
    this.backdrop = backdrop;
    this.modal = modal;
    this.templateFunc = templateFunc;
    this.image = null;
    this.imageView = null;

    this.addEventHandling();
  }

  addEventHandling() {
    this.view.on(View.VIEW_IMAGE_EVENT, this.showImage.bind(this));

    document.addEventListener("keydown", e => {
      switch (e.key) {
        case "Escape":
          this.hide();
          break;
        case "ArrowLeft":
          this.showPrevImage();
          break;
        case "ArrowRight":
          this.showNextImage();
          break;
      }
    });

    document.addEventListener("click", e => {
      this.hide();
    });

    this.backdrop.addEventListener("click", e => {
      this.hide();
    });

    this.modal.addEventListener("click", e => {
      e.stopPropagation();
      const target = e.target;
      const classList = target.classList;
      if (classList.contains(ModalManager.CLOSE_CLASS)) {
        this.hide();
      } else if (classList.contains(ModalManager.PREV_CLASS)) {
        this.showPrevImage();
      } else if (classList.contains(ModalManager.NEXT_CLASS)) {
        this.showNextImage();
      } else if (classList.contains(ModalManager.ADD_TO_FAVS_CLASS)) {
        this.raiseAddToFavsEvent();
      }
    });

    // this.modal.addEventListener("touchstart", e => {
    //   console.log('touchStart');
    // });
    // this.modal.addEventListener("touchend", e => {
    //   console.log('touchEnd');
    // });
    // this.modal.addEventListener("touchmove", e => {
    //   console.log('touchMove');
    // });
    // this.modal.addEventListener("touchcancel", e => {
    //   console.log('touchCancel');
    // });
  }

  static create(...args) {
    return new ModalManager(...args);
  }

  raiseAddToFavsEvent() {
    const image = this.image;
    const arg = {
      id: image.dataset.id,
      src: image.src,
      alt: image.alt,
      view: image.dataset.view
    };
    this.view.raiseEvent(View.ADD_TO_FAVS_EVENT, arg);
  }

  showImage(item, navOnly = false, templateFunc = this.templateFunc) {
    const dataObj = {
      id: item.dataset.id,
      src: item.dataset.view,
      alt: item.alt,
      view: item.src
    };
    this.image = item;

    const markup = templateFunc(dataObj);
    this.modal.innerHTML = markup;
    if (navOnly) {
      const tools = this.modal.querySelector(ModalManager.IMAGE_TOOLS_SELECTOR);
      Array.from(tools.children)
        .filter(tool => tool.classList.contains(ModalManager.ADD_TO_FAVS_CLASS))
        .forEach(tool => {
          tool.remove();
        });
    }
    this.imageView = this.modal.querySelector(ModalManager.VIEW_SELECTOR);
    document.body.classList.remove(ModalManager.MODAL_HIDDEN_CLASS);
  }

  showPrevImage() {
    if (this.image) {
      const prevGalleryItem = this.image.parentElement.previousElementSibling;
      if (prevGalleryItem) {
        this.image = prevGalleryItem.classList.contains(View.RESULTS_ITEM_CLASS) ? prevGalleryItem.firstElementChild : prevGalleryItem.lastElementChild;
        const view = this.imageView;
        const prev = this.image;
        view.dataset.id = prev.dataset.id;
        view.src = prev.dataset.view;
        view.alt = prev.alt;
        view.dataset.view = prev.src;
      }
    }
  }

  showNextImage() {
    if (this.image) {
      const nextGalleryItem = this.image.parentElement.nextElementSibling;
      if (nextGalleryItem) {
        this.image = nextGalleryItem.classList.contains(View.RESULTS_ITEM_CLASS) ? nextGalleryItem.firstElementChild : nextGalleryItem.lastElementChild;
        const view = this.imageView;
        const next = this.image;
        view.dataset.id = next.dataset.id;
        view.src = next.dataset.view;
        view.alt = next.alt;
        view.dataset.view = next.src;
      }
    }
  }

  hide() {
    document.body.classList.add(ModalManager.MODAL_HIDDEN_CLASS);
  }
}

ModalManager.MODAL_SELECTOR = ".modal";
ModalManager.VIEW_SELECTOR = ".js-view";
ModalManager.IMAGE_TOOLS_SELECTOR = ".js-tools";

ModalManager.MODAL_HIDDEN_CLASS = "modal-hidden";
ModalManager.CLOSE_CLASS = "js-close";
ModalManager.IMAGE_TOOL_CLASS = "js-tool";
ModalManager.PREV_CLASS = "js-prev";
ModalManager.NEXT_CLASS = "js-next";
ModalManager.ADD_TO_FAVS_CLASS = "js-save";
