type Cb<T> = (arg: T) => any;

export default class MiniEvent<T> {
  listeners = new Set<Cb<T>>();

  addListener = (cb: Cb<T>) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  emit = (arg: T) => {
    this.listeners.forEach(l => l(arg));
  };
}
