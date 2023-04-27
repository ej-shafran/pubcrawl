import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";

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
 * // get the current state within an array
 * const [person] = store.get();
 *
 * // remove the subscriber we set up
 * unsub();
 *
 * // if `TData` is a function...
 * const store = new Store<(person: Person, isCool: boolean) => void>();
 * // we'll be expected to pass the parameters of `TData`
 * store.set({ name: "Evyatar", age: 19 }, true);
 * // and that's also what `subscribe`'s callbacks will get
 * store.subscribe((person, isCool) => {
 *   // do stuff here...
 * })
 * // and what `get` will return
 * const [person, isCool] = store.get();
 **/
export class Store<TData> {
  #publisher = new Publisher<TData>();
  #value: Parameters<Subscription<TData>> | [];

  /**
   * Keeps track of the currently held data (as a tuple, since it's passed to callbacks by spreading),
   * and updates its subscribers whenever that data is changed.
   *
   * @param args Values to initialize the state with.
   **/
  constructor(...args: Parameters<Subscription<TData>> | []) {
    this.#value = args;
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
   * // `data` will be an empty array
   * let data = store.get();
   *
   * store.set({ name: "Evyatar", age: 19 });
   *
   * // `data` will be `[{ name: "Evyatar", age: 19 }]`
   * data = store.get();
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
  set(...args: Parameters<Subscription<TData>>) {
    this.#value = args;
    this.#publisher.publish(...args);
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
  subscribe(cb: Subscription<TData>) {
    return this.#publisher.subscribe(cb);
  }
}
