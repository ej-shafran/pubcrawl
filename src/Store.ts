import { Publisher } from "./Publisher";

/**
 * Keeps track of the currently held data (as a tuple, since it's passed to callbacks by spreading),
 * and updates its subscribers whenever that data is changed.
 *
 * @example
 * type Person = {
 *   name: string;
 *   age: number;
 * }
 *
 * const store = new Store<Person>();
 *
 * const unsub = store.subscribe((person) => {
 *   // do stuff with the `person` here
 * });
 *
 * // update the internal state and notify all subscribers
 * store.set({ name: "Evyatar", age: 19 });
 *
 * // get the current state
 * const person = store.get();
 * //      ^? Person | undefined
 *
 * // remove the subscriber we set up
 * unsub();
 **/
export class Store<TData> {
  #publisher = new Publisher<(data: TData) => void>();
  #value: TData | undefined;

  /**
   * Keeps track of the currently held data (as a tuple, since it's passed to callbacks by spreading),
   * and updates its subscribers whenever that data is changed.
   *
   * @param args Values to initialize the state with.
   **/
  constructor(initialValue?: TData) {
    this.#value = initialValue;
  }

  /**
   * Get a snapshot of the store's current state.
   *
   * @returns the data currently being held, **as an array**; an empty array is returned if no data has been set for the store yet.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const store = new Store<Person>();
   *
   * // `person` will be `undefined`
   * let person = store.get();
   *
   * store.set({ name: "Evyatar", age: 19 });
   *
   * // `person` will be `{ name: "Evyatar", age: 19 }`
   * person = store.get();
   **/
  get() {
    return this.#value;
  }

  /**
   * Update the store's state with new data, and notify all subscribers of this change.
   *
   * @param args The new data to keep within the store.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const store = new Store<Person>();
   *
   * store.subscribe((person) => {
   *   // do stuff with the `person`...
   * })
   *
   * // these calls will:
   * // a) trigger all subscribers
   * // b) update the state for any `get` calls
   * store.set({ name: "Evyatar", age: 19 });
   * store.set({ name: "John", age: 27 });
   * store.set({ name: "Doe", age: 51 });
   **/
  set(value: TData) {
    this.#value = value;
    this.#publisher.publish(value);
  }

  /**
   * Add a new subscriber which will be notified of the store's state changing.
   *
   * @param cb A callback which will be called with the new data on every change.
   *
   * @returns An `unsubscribe` function that removes this subscriber.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const store = new Store<Person>();
   *
   * const unsub = store.subscribe((person) => {
   *   console.log(person);
   *   //           ^? Person
   * })
   *
   * // any `set` calls here will trigger our `console.log`...
   * unsub();
   * // but any `set` calls from here on out will not
   **/
  subscribe(cb: (data: TData) => void) {
    return this.#publisher.subscribe(cb);
  }
}

