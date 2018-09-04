export default class Storage {
  constructor(key) {
    this.storage = null;
    this.key = key;

    if (window.localStorage) {
      this.storage = window.localStorage;
      if (!this.storage.getItem(key)) {
        this.storage.setItem(key, JSON.stringify({ items: [] }));
      }
    }
  }

  static create(key) {
    let storage = null;
    try {
      storage = new Storage(key);
    } catch (err) {
      console.log(err.message);
    }
    return storage;
  }

  get() {
    if (!this.storage) {
      return null;
    }

    return JSON.parse(this.storage.getItem(this.key));
  }

  set(value) {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(this.key, JSON.stringify(value));
  }

  items() {
    try {
      const data = this.get();
      if (data && data.items) {
        return data.items;
      } else {
        this.set({ items: [] });
        return [];
      }
    } catch (err) {
      console.log(err.message);
      return [];
    }
  }

  add(item) {
    const data = this.get();
    data.items.push(item);
    this.set(data);
  }

  remove(id) {
    const data = this.get();
    const items = data.items;
    data.items = items.filter(item => item.id !== id);
    this.set(data);
  }
}