import type { valueof } from "./common/types/valueof";

export class TypedMap<T> {
  #map = new Map<PropertyKey, any>();

  get<K extends keyof T>(key: K) {
    return this.#map.get(key) as T[K];
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    return this.#map.set(key, value);
  }

  has<K extends keyof T>(key: K) {
    return this.#map.has(key);
  }

  delete<K extends keyof T>(key: K) {
    return this.#map.delete(key);
  }

  clear() {
    return this.#map.clear();
  }

  keys() {
    return this.#map.keys() as IterableIterator<keyof T>;
  }

  values() {
    return this.#map.values() as IterableIterator<valueof<T>>;
  }

  entries() {
    return this.#map.entries() as IterableIterator<[keyof T, valueof<T>]>;
  }

  forEach(callbackFn: <K extends keyof T>(value: T[K], key: K, map: TypedMap<T>) => void) {
    this.#map.forEach(function (this: TypedMap<T>, value, key) {
      callbackFn(value, key as keyof T, this);
    })
  }
}
