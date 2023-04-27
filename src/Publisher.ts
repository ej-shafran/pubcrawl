import { Subscription } from "./Subscription";

/**
 * Keeps track of subscribers and notifies them whenever necessary (i.e. - when the `publish` method is called).
 * A Publisher does not keep track of the data it has published; see Store for that functionality.
 *
 * If the `TData` type param is a function, the subscribers will expect that function's parameters.
 * Otherwise, they will expect `TData` itself.
 *
 * @example
 * type Person = {
 *   name: string;
 *   age: number;
 * }
 *
 * const publisher = new Publisher<Person>();
 *
 * const unsub = publisher.subscribe((person) => {
 *   // do stuff with the `person` here
 * });
 *
 * // call all subscribers with this data
 * publisher.publish({ name: "Evyatar", age: 19 });
 *
 * // remove the subscriber we set up
 * unsub();
 *
 * // clear all subscribers
 * publisher.clear();
 *
 * // if `TData` is a function...
 * const publisher = new Publisher<(person: Person, isCool: boolean) => void>();
 * // we'll be expected to pass the parameters of `TData`
 * publisher.publish({ name: "Evyatar", age: 19 }, true);
 * // and that's also what `subscribe`'s callbacks will get
 * publisher.subscribe((person, isCool) => {
 *   // do stuff here...
 * })
 **/
export class Publisher<TData> {
  #subscribers = new Set<Subscription<TData>>();

  /**
   * Keeps track of subscribers and notifies them whenever necessary (i.e. - when the `publish` method is called).
   * A Publisher does not keep track of the data it has published; see Store for that functionality.
   *
   * If the `TData` type param is a function, the subscribers will expect that function's parameters.
   * Otherwise, they will expect `TData` itself.
   **/
  constructor() { }

  /**
   * Add a new subscriber.
   *
   * @param cb Will be called whenever new data is published.
   *
   * @returns An `unsubscribe` function that removes this subscriber.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const publisher = new Publisher<Person>();
   *
   * const unsub = publisher.subscribe((person) => {
   *   console.log(person);
   *   //           ^? Person
   * })
   *
   * // any `publish` calls here will trigger our `console.log`...
   * unsub();
   * // but any `publish` calls from here will not
   **/
  subscribe(cb: Subscription<TData>) {
    this.#subscribers.add(cb);

    return () => {
      this.#subscribers.delete(cb);
    };
  }

  /**
   * Notify all subscribers with some data.
   *
   * @param params what to call the subscriber callbacks with (i.e. - the data to notify them of)
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const publisher = new Publisher<Person>();
   *
   * publisher.subscribe(console.log);
   *
   * // all of these will be logged
   * publisher.publish({ name: "Evyatar", age: 19 });
   * publisher.publish({ name: "Joe", age: 25 });
   **/
  publish<Params extends Parameters<Subscription<TData>>>(...params: Params) {
    this.#subscribers.forEach((cb) => {
      cb(...params);
    });
  }

  /**
   * Removes all subscribers.
   **/
  clear() {
    this.#subscribers.clear();
  }
}
