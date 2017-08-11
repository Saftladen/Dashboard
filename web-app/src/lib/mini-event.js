export default class MiniEvent {
  listeners = new Set();

  addListener = cb => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  emit = (...args) => {
    this.listeners.forEach(l => l(...args));
  };

  isSomeoneListening = () => this.listeners.size > 0;
}
