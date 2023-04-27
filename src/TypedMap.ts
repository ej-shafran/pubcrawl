import type { valueof } from "./common/types/valueof";

/**
 * A wrapper for the JavaScript `Map` object that adds strong typing;
 * uses an object type (`TData`) to know what the type of a value for a specific key is.
 **/
export class TypedMap<TData> {
  #map: Map<PropertyKey, any>;

  constructor(initialValues?: Partial<TData>) {
    this.#map = new Map(
      initialValues ? Object.entries(initialValues) : undefined
    );
  }

  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   *
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   **/
  get<K extends keyof TData>(key: K) {
    return this.#map.get(key) as TData[K] | undefined;
  }

  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   **/
  set<K extends keyof TData>(key: K, value: TData[K]) {
    return this.#map.set(key, value);
  }

  /**
   * @returns boolean indicating whether an element with the specified key exists or not
   **/
  has<K extends keyof TData>(key: K) {
    return this.#map.has(key);
  }

  /**
   * @returns `true` if an element in the Map existed and has been removed, or `false` if the element does not exist.
   **/
  delete<K extends keyof TData>(key: K) {
    return this.#map.delete(key);
  }

  clear() {
    return this.#map.clear();
  }

  /**
   * Returns an iterable of keys in the map
   **/
  keys() {
    return this.#map.keys() as IterableIterator<keyof TData>;
  }

  /**
   * Returns an iterable of values in the map
   **/
  values() {
    return this.#map.values() as IterableIterator<valueof<TData>>;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   **/
  entries() {
    return this.#map.entries() as IterableIterator<
      [keyof TData, valueof<TData>]
    >;
  }

  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   **/
  forEach(
    callbackFn: <K extends keyof TData>(
      value: TData[K],
      key: K,
      map: TypedMap<TData>
    ) => void
  ) {
    this.#map.forEach(function(this: TypedMap<TData>, value, key) {
      callbackFn(value, key as keyof TData, this);
    });
  }
}
