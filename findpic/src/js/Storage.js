export default class Storage {
  constructor(key) {
    let storage = null;
    this.key = key;

    if (window.localStorage) {
      storage = window.localStorage;
      if (!storage.getItem(key)) {
        storage.setItem(key, JSON.stringify({ items: [] }));
      }
    }

    this.get = () => {
      if (!storage) {
        return null;
      }

      return JSON.parse(storage.getItem(this.key));
    }

    this.set = value => {
      if (!storage) {
        return;
      }

      storage.setItem(this.key, JSON.stringify(value));
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

  removeItems(keys) {
    const data = this.get();
    data.items = data.items.filter(item => !keys.includes(item.id));
    this.set(data);
  }
}