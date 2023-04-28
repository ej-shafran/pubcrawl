import { Publisher } from "./Publisher";
import { TypedMap } from "./TypedMap";

type MapToPublishers<
  THandlers extends Record<PropertyKey, (...args: any[]) => any>
> = {
    [TKey in keyof THandlers]: Publisher<THandlers[TKey]>;
  };

type FollowerArguments<
  THandlers extends Record<PropertyKey, (...args: any[]) => any>
> = {
  [TKey in keyof THandlers]: [key: TKey, ...args: Parameters<THandlers[TKey]>];
}[keyof THandlers];

/**
 * Keeps track of an associative map of keys to publishers.
 * None of its publishers holds any internal state; see Client for that functionality.
 *
 * @example
 * type Person = {
 *   name: string;
 *   age: number;
 * }
 *
 * type BlogEvents = {
 *   newReader: (latest: Person, readers: Person[]) => void;
 *   like: (count: number) => void;
 * }
 *
 * const network = new Network<BlogEvents>();
 *
 * const unsub = network.subscribe("newReader", (latest, readers) => {
 *   // do stuff with `reader` and `readers` here
 * });
 *
 * // call all subscribers with this data
 * network.publish("newReader", { name: "Evyatar", age: 19 }, [{ name: "Evyatar", age: 19 }]);
 *
 * // remove the subscriber we set up
 * unsub();
 *
 * const unfollow = network.follow((event, ...data) => {
 *   // `key` is `"newReader" | "like"`
 *   // `data` is either `[Person, Person[]]` or `[number]`
 * })
 *
 * // remove the follower we set up
 * unfollow();
 *
 * // clear all subscribers for a specific key
 * network.clear("newReader");
 *
 * // clear all subscribers along with followers
 * network.fullClear();
 **/
export class Network<
  THandlers extends Record<PropertyKey, (...args: any[]) => any>
> {
  #publishers = new TypedMap<MapToPublishers<THandlers>>();
  #followers = new Publisher<(...args: FollowerArguments<THandlers>) => void>();

  /**
   * Keeps track of an associative map of keys to publishers.
   * None of its publishers holds any internal state; see Client for that functionality.
   **/
  constructor() { }

  /**
   * Add a new subscriber to a specific event.
   *
   * @param event The specific event to subscribe to.
   * @param cb Will be called whenever new data is published to `event`
   *
   * @returns An `unsubscribe` function that removes this subscriber.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * type BlogEvents = {
   *   newReader: (latest: Person, readers: Person[]) => void;
   *   like: (count: number) => void;
   * }
   *
   * const network = new Network<BlogEvents>();
   *
   * // we subscribe to a specific event that the network will report on
   * const unsub = network.subscribe("newReader", (latest, readers) => {
   *   console.log(latest);
   *   //           ^? Person
   *   console.log(readers);
   *   //           ^? Person[]
   * })
   *
   * // any `publish` calls to "newReader" here will trigger our `console.log`...
   * unsub();
   * // but any `publish` calls to "newReader" from here on out will not
   **/
  subscribe<K extends keyof THandlers>(key: K, cb: THandlers[K]) {
    if (!this.#publishers.has(key)) {
      const publisher = new Publisher<THandlers[K]>();
      const unsub = publisher.subscribe(cb);
      this.#publishers.set(key, publisher);
      return unsub;
    } else {
      const publisher = this.#publishers.get(key);
      return publisher!.subscribe(cb);
    }
  }

  /**
   * Notify all subscribers to a specific event with some data.
   * Also notifies all followers that are listening to every key.
   *
   * @param event The specific event to publish to.
   * @param params What to call the subscriber callbacks with (i.e. - the data to notify them of).
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * type BlogEvents = {
   *   newReader: (latest: Person, readers: Person[]) => void;
   *   like: (count: number) => void;
   * }
   *
   * const network = new Network<BlogEvents>();
   *
   * network.subscribe("like", (count) => {
   *   // do stuff...
   * })
   * network.follow(console.log);
   *
   * // both of these will be logged
   * network.publish("newReader", { name: "Evyatar", age: 19 }, [{ name: "Evyatar", age: 19 }]);
   * // but only this will trigger our "do stuff" callback
   * network.publish("like", 10);
   **/
  publish<TEvent extends keyof THandlers>(
    event: TEvent,
    ...args: Parameters<THandlers[TEvent]>
  ) {
    const publisher = this.#publishers.get(event);
    publisher?.publish(...args);
    this.#followers.publish(event, ...args);
  }

  /**
   * Add a "follower", which listens to data published to every key (A.K.A "channel" or "event").
   *
   * @param cb Will be called whenever data is published to **any** of the network's keys.
   *
   * @returns An `unfollow` function that removes this follower.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * type BlogEvents = {
   *   newReader: (latest: Person, readers: Person[]) => void;
   *   like: (count: number) => void;
   * }
   *
   * const network = new Network<BlogEvents>();
   *
   * const unfollow = network.follow((key, ...data) => {
   *   console.log(key);
   *   //           ^? "newReader" | "like"
   *   console.log(data);
   *   //           ^? [Person, Person[]] | [number]
   * });
   *
   * // any data published here will trigger the follower,
   * // no matter which key it is publishing to
   * network.publish("newReader", { name: "Evyatar", age: 19 }, [{ name: "Evyatar", age: 19 }]);
   * network.publish("like", 10);
   *
   * unfollow();
   *
   * // from here on, the follower will not be called
   **/
  follow(cb: (...args: FollowerArguments<THandlers>) => void) {
    return this.#followers.subscribe(cb);
  }

  /**
   * Clear all subscribers for a specific event.
   *
   * @param key The key to clear the subscribers of.
   **/
  clear(key: keyof THandlers) {
    this.#publishers.get(key)?.clear();
  }

  /**
   * Removes all subscribers **and followers**, for every key.
   **/
  fullClear() {
    this.#publishers.clear();
    this.#followers.clear();
  }
}
