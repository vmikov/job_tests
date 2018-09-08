export default class Model {
  constructor(storage) {
    this.storage = storage;
    this.favs = storage ? storage.items() : [];
  }

  has(id) {
    const favs = this.favs.filter(item => item.id === id);
    return favs.length > 0;
  }

  add(item) {
    if (this.has(item.id)) {
      return;
    }

    this.favs.push(item);
    this.storage.add(item);
  }

  remove(id) {
    const fav = this.favs.find(item => item.id === id);
    if (fav === undefined) {
      return null;
    }

    this.favs = this.favs.filter(item => item.id !== id);
    this.storage.remove(id);
    return fav;
  }

  filterItems(items) {
    const keys = this.favs.filter(item => !items.includes(item)).map(item => item.id);
    this.favs = this.favs.filter(item => items.includes(item));
    this.storage.removeItems(keys);
  }
}