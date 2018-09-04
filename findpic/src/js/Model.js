export default class Model {
  constructor(storage) {
    if (!storage) {
      throw new Error('Invalid storage argument');
    }

    this.storage = storage;
    const data = storage.get();
    this.favs = data && data.items ? data.items : [];
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
    const data = this.storage.get();
    if (data && data.items) {
      data.items.push(item);
      this.storage.set(data);
    }
  }

  remove(id) {
    const favs = this.favs.filter(item => item.id === id);
    if (favs.length === 0) {
      return null;
    }

    const item = favs[0];
    this.favs = this.favs.filter(item => item.id !== id);
    const data = this.storage.get();
    if (data && data.items) {
      const items = data.items;
      data.items = items.filter(item => item.id !== id);
      this.storage.set(data);
    }

    return item;
  }
}