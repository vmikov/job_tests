import EventEmitter from "./EventEmitter";
import queryTemplateFunc from "../templates/gallery.hbs";
import favsTemplateFunc from "../templates/favs.hbs";

export default class View extends EventEmitter {
  constructor() {
    super();
    this.favsCached = false;
    this.header = document.querySelector(View.HEADER_SELECTOR);
    this.logo = document.querySelector(View.LOGO_SELECTOR);
    this.favsButton = document.querySelector(View.FAVS_MENU_SELECTOR);
    this.startSearchForm = document.querySelector(View.SEARCH_FORM_SELECTOR);
    this.startSearchInput = document.querySelector(View.SEARCH_INPUT_SELECTOR);
    this.nextSearchButton = document.querySelector(View.NEXT_SEARCH_SELECTOR);
    this.resultsGallery = document.querySelector(View.RESULTS_GALLERY_SELECTOR);
    this.favsGallery = document.querySelector(View.FAVS_GALLERY_SELECTOR);
    this.queryResults = document.querySelector(View.QUERY_RESULTS_SELECTOR);
    this.favs = document.querySelector(View.FAVS_SELECTOR);
    this.btnToTop = document.querySelector(View.TO_TOP_SELECTOR);

    this.addEventHandling();
    this.initScrolling();
  }

  raiseEvent(event, ...args) {
    switch (event) {
      case View.ADD_TO_FAVS_EVENT:
        this.favsCached = false;
        break;
    }
    this.emit(event, ...args);
  }

  initScrolling() {
    const throttled = (fn, delay = 50) => {
      let lastCalled = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCalled < delay) {
          return;
        }
        lastCalled = now;
        fn(...args);
      };
    };

    const scrollHandler = e => {
      this.showToTopButton(window.pageYOffset > 50);
    };

    window.addEventListener("scroll", throttled(scrollHandler));

    this.btnToTop.addEventListener("click", e => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    });

    document.addEventListener("keydown", e => {
      switch (e.key) {
        case "Home":
          window.scrollTo({ top: 0, left: 0, behaviour: "smooth" });
          break;
        case "End":
          window.scrollTo({ top: document.body.offsetHeight, left: 0, behaviour: "smooth" });
          break;
        case "ArrowUp":
          window.scrollBy(0, -10);
          break;
        case "ArrowDown":
          window.scrollBy(0, 10);
          break;
      }
    });
  }

  showToTopButton(show) {
    this.btnToTop.style.opacity = show ? "1" : "0";
  }

  addEventHandling() {
    let page;

    this.resultsGallery.addEventListener('click', this.handleQueryImageEvent.bind(this));
    this.favsGallery.addEventListener('click', this.handleFavImageEvent.bind(this));
    this.favsButton.addEventListener('click', this.viewFavs.bind(this));
    this.logo.addEventListener('click', this.viewQueryResults.bind(this));

    this.startSearchForm.addEventListener('submit', e => {
      e.preventDefault();
      page = 1;
      this.emit(View.START_SEARCH_EVENT, this.startSearchInput.value, page);
      this.clearResults();
    });

    this.nextSearchButton.addEventListener('click', e => {
      this.emit(View.NEXT_SEARCH_EVENT, this.startSearchInput.value, ++page);
    });
  }

  handleQueryImageEvent(e) {
    e.stopPropagation();
    if (e.target.classList.contains(View.GALLERY_ITEM_CLASS)) {
      this.viewImage(e.target);
    }
  }

  handleFavImageEvent(e) {
    e.stopPropagation();
    if (e.target.classList.contains(View.REMOVE_FAVITEM_CLASS)) {
      this.removeImage(e.target.nextElementSibling);
    }
    if (e.target.classList.contains(View.GALLERY_ITEM_CLASS)) {
      this.viewImage(e.target, true);
    }
  }

  viewImage(image, navOnly) {
    this.emit(View.VIEW_IMAGE_EVENT, image, navOnly);
  }

  removeImage(image) {
    this.emit(View.REMOVE_FAVITEM_EVENT, image.dataset.id);
  }

  viewFavs() {
    if (this.favsCached) {
      this.queryResults.classList.add(View.HIDDEN_CLASS);
      this.favs.classList.remove(View.HIDDEN_CLASS);

      this.logo.classList.remove(View.LOGO_INIT_CLASS);
      this.header.classList.remove(View.HEADER_INIT_CLASS);
    } else {
      this.emit(View.VIEW_FAVS_EVENT);
    }
  }

  viewQueryResults(e) {
    if (e) {
      e.preventDefault();
    }

    if (e && e.target === this.logo && !this.queryResults.classList.contains(View.HIDDEN_CLASS)) {
      return;
    }

    if (this.resultsGallery.children.length === 0) {
      this.header.classList.add(View.HEADER_INIT_CLASS);
      this.logo.classList.add(View.LOGO_INIT_CLASS);
      this.nextSearchButton.classList.add(View.HIDDEN_CLASS);
    } else {
      this.logo.classList.remove(View.LOGO_INIT_CLASS);
      this.header.classList.remove(View.HEADER_INIT_CLASS);
      this.nextSearchButton.classList.remove(View.HIDDEN_CLASS);
    }
    this.startSearchInput.focus();

    this.favs.classList.add(View.HIDDEN_CLASS);
    this.queryResults.classList.remove(View.HIDDEN_CLASS);
  }

  clearResults() {
    this.logo.classList.add(View.LOGO_INIT_CLASS);
    this.header.classList.add(View.HEADER_INIT_CLASS);
    this.resultsGallery.innerHTML = '';
    this.nextSearchButton.classList.add(View.HIDDEN_CLASS);
  }

  displayServiceData(items) {
    const markup = queryTemplateFunc(items);
    this.resultsGallery.insertAdjacentHTML('beforeend', markup);
    this.viewQueryResults();
  }

  displayFavs(items) {
    this.favsCached = true;

    const markup = favsTemplateFunc(items);
    this.favsGallery.innerHTML = markup;
    this.logo.classList.remove(View.LOGO_INIT_CLASS);
    this.header.classList.remove(View.HEADER_INIT_CLASS);

    this.queryResults.classList.add(View.HIDDEN_CLASS);
    this.favs.classList.remove(View.HIDDEN_CLASS);
  }

  removeFav(item) {
    const img = this.favsGallery.querySelector(`[data-id='${item.id}']`);
    if (img) {
      img.parentElement.remove();
    }
  }
}

View.START_SEARCH_EVENT = "start_search";
View.NEXT_SEARCH_EVENT = "next_search";
View.VIEW_IMAGE_EVENT = 'view_image';
View.ADD_TO_FAVS_EVENT = 'add_to_favs';
View.VIEW_FAVS_EVENT = 'view_favs';
View.REMOVE_FAVITEM_EVENT = 'remove_favitem_event'

View.HIDDEN_CLASS = 'hidden';
View.LOGO_INIT_CLASS = 'logo--init';
View.HEADER_INIT_CLASS = 'header-init';
View.NEXT_SEARCH_CLASS = "js-query-next";
View.GALLERY_ITEM_CLASS = 'js-gallery-item';
View.REMOVE_FAVITEM_CLASS = 'js-fav-remove';
View.RESULTS_ITEM_CLASS = "js-results-item";
View.FAVS_ITEM_CLASS = "js-favs-item";

View.FAVS_MENU_SELECTOR = '.js-menu-favs';
View.LOGO_SELECTOR = '.js-logo';
View.HEADER_SELECTOR = '.js-header';
View.SEARCH_INPUT_SELECTOR = ".js-query-subject";
View.SEARCH_FORM_SELECTOR = ".js-query-start";
View.NEXT_SEARCH_SELECTOR = "." + View.NEXT_SEARCH_CLASS;
View.QUERY_RESULTS_SELECTOR = ".js-query-results";
View.FAVS_SELECTOR = ".js-favs";
View.RESULTS_GALLERY_SELECTOR = ".js-results-gallery";
View.FAVS_GALLERY_SELECTOR = ".js-favs-gallery";
View.TO_TOP_SELECTOR = ".js-to-top";