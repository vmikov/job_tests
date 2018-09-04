export default class EventEmitter {
  constructor() {
    this.eventListeners = {};
  }

  on(event, listener) {
    const listeners = this.eventListeners[event] || [];
    this.eventListeners[event] = listeners;
    listeners.push(listener)
  }

  emit(event, ...args) {
    const listeners = this.eventListeners[event] || [];
    listeners.forEach(listener => listener(...args));
  }
}