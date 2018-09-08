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
    try {
      this.model.add(item);
    } catch (err) {
      console.log(err.message);
    }
  }

  removeFromFavourites(id) {
    try {
      this.model.remove(id);
      this.view.removeFav({ id });
    } catch (err) {
      console.log(err.message);
    }
  }

  viewFavourites() {
    this.checkImages(this.model.favs);
  }

  checkImages(images) {
    const promises = images.map(image => {
      const p = new Promise((resolve) => {
        const img = new Image();
        img.onload = e => {
          resolve(image);
        };
        img.src = image.src;
        setTimeout(() => {
          resolve(null);
        }, 1000);
      });
      return p;
    });

    Promise.all(promises)
      .then(data => data.filter(item => item !== null))
      .then(data => {
        this.view.displayFavs(data)
        this.model.filterItems(data)
      })
      .catch(err => console.log(err.message));
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
