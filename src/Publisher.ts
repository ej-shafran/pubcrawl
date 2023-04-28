/**
 * Keeps track of subscribers and notifies them whenever necessary (i.e. - when the `publish` method is called).
 * A Publisher does not keep track of the data it has published; see Store for that functionality.
 *
 * @example
 * type Person = {
 *   name: string;
 *   age: number;
 * }
 *
 * const publisher = new Publisher<(person: Person) => void>();
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
 **/
export class Publisher<TSub extends (...args: any) => void> {
  #subscribers = new Set<TSub>();

  /**
   * Keeps track of subscribers and notifies them whenever necessary (i.e. - when the `publish` method is called).
   * A Publisher does not keep track of the data it has published; see Store for that functionality.
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
   * const publisher = new Publisher<(person: Person) => void>();
   *
   * const unsub = publisher.subscribe((person) => {
   *   console.log(person);
   *   //           ^? Person
   * })
   *
   * // any `publish` calls here will trigger our `console.log`...
   * unsub();
   * // but any `publish` calls from here on out will not
   **/
  subscribe(cb: TSub) {
    this.#subscribers.add(cb);

    return () => {
      this.#subscribers.delete(cb);
    };
  }

  /**
   * Notify all subscribers with some data.
   *
   * @param params What to call the subscriber callbacks with (i.e. - the data to notify them of)
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * const publisher = new Publisher<(person: Person) => void>();
   *
   * publisher.subscribe(console.log);
   *
   * // all of these will be logged
   * publisher.publish({ name: "Evyatar", age: 19 });
   * publisher.publish({ name: "Joe", age: 25 });
   **/
  publish(...params: Parameters<TSub>) {
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
