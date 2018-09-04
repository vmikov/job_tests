import View from "./View";

export default class Controller {
  constructor(model, view) {
    if (!(model && view)) {
      throw new Error("Invalid argument error");
    }

    this.model = model;
    this.view = view;

    view.on(View.START_SEARCH_EVENT, this.startSearch.bind(this));
    view.on(View.NEXT_SEARCH_EVENT, this.nextSearch.bind(this));
    view.on(View.ADD_TO_FAVS_EVENT, this.addToFavourites.bind(this));
    view.on(View.VIEW_FAVS_EVENT, this.viewFavourites.bind(this));
    view.on(View.REMOVE_FAVITEM_EVENT, this.removeFromFavourites.bind(this));
  }

  startSearch(query, page) {
    this.getData(query, page);
  }

  nextSearch(query, page) {
    this.getData(query, page);
  }

  addToFavourites(item) {
    this.model.add(item);
  }

  removeFromFavourites(id) {
    const fav = this.model.remove(id);
    this.view.removeFav(fav);
  }

  viewFavourites() {
    this.view.displayFavs(this.model.favs);
  }

  getData(query, page) {
    if (!this.service) {
      return;
    }

    this.service
      .get({ query, page })
      .then(data => {
        const items = data.map(item => ({
          id: item.id,
          src: item.webformatURL,
          view: item.largeImageURL,
          alt: item.webformatURL.slice(item.webformatURL.lastIndexOf('/') + 1)
        }));
        this.view.displayServiceData(items);
      })
      .catch(err => console.error(err.message));
  }
}
