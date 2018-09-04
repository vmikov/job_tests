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

  get() {
    if (!this.storage) {
      return null;
    }

    let value = this.storage.getItem(this.key);
    try {
      value = JSON.parse(value);
    } catch (err) {
      console.log(err.message);
      value = { items: [] };
    }
    return value;
  }

  set(value) {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(this.key, JSON.stringify(value));
    } catch (err) {
      console.log(err.message);
    }
  }
}