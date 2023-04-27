import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";
import { TypedMap } from "./TypedMap";
import { valueof } from "./common/types/valueof";

type PublishersForObject<T> = {
  [P in keyof T]: Publisher<T[P]>;
};

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
 * type BlogInfo = {
 *   readers: Person[];
 *   latestReader: Person;
 *   likes: number;
 * }
 *
 * const network = new Network<Person>();
 *
 * const unsub = network.subscribe("latestReader", (person) => {
 *   // do stuff with the `person` here
 * });
 *
 * // call all subscribers with this data
 * network.publish("latestReader", { name: "Evyatar", age: 19 });
 *
 * // remove the subscriber we set up
 * unsub();
 *
 * const unfollow = network.follow((key, data) => {
 *   // `key` is any of the keys of `BlogInfo`
 *   // `data` is any of the values of `BlogInfo`
 * })
 *
 * // remove the follower we set up
 * unfollow();
 *
 * // clear all subscribers for a specific key
 * network.clear("readers");
 *
 * // clear all subscribers along with followers
 * network.fullClear();
 **/
export class Network<TData> {
  #publishers = new TypedMap<PublishersForObject<TData>>();
  #followers = new Publisher<valueof<TData>>();

  /**
   * Keeps track of an associative map of keys to publishers.
   * None of its publishers holds any internal state; see Client for that functionality.
   **/
  constructor() { }

  /**
   * Add a new subscriber to a specific key.
   *
   * @param key The specific key, A.K.A "event" or "channel" to subscribe to.
   * @param cb Will be called whenever new data is published to the channel specified by `key`.
   *
   * @returns An `unsubscribe` function that removes this subscriber.
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * type BlogInfo = {
   *   readers: Person[];
   *   latestReader: Person;
   *   likes: number;
   * }
   *
   * const network = new Network<BlogInfo>();
   *
   * // we subscribe to a specific `key`, or event, that the network will report on
   * const unsub = network.subscribe("readers", (person) => {
   *   console.log(person);
   *   //           ^? Person[]
   * })
   *
   * // any `publish` calls to "readers" here will trigger our `console.log`...
   * unsub();
   * // but any `publish` calls to "readers" from here on out will not
   **/
  subscribe<K extends keyof TData>(key: K, cb: Subscription<TData[K]>) {
    if (!this.#publishers.has(key)) {
      const publisher = new Publisher<TData[K]>();
      const unsub = publisher.subscribe(cb);
      this.#publishers.set(key, publisher);
      return unsub;
    } else {
      const publisher = this.#publishers.get(key);
      return publisher!.subscribe(cb);
    }
  }

  /**
   * Notify all subscribers to a specific key with some data.
   * Also notifies all followers that are listening to every key.
   *
   * @param key The specific key, A.K.A "event" or "channel" to publish to.
   * @param params What to call the subscriber callbacks with (i.e. - the data to notify them of)
   *
   * @example
   * type Person = {
   *   name: string;
   *   age: number;
   * }
   *
   * type BlogInfo = {
   *   readers: Person[];
   *   latestReader: Person;
   *   likes: number;
   * }
   *
   * const network = new Network<BlogInfo>();
   *
   * network.subscribe("likes", (likes) => {
   *   // do stuff...
   * })
   * network.follow(console.log);
   *
   * // both of these will be logged
   * network.publish("latestReader", { name: "Evyatar", age: 19 });
   * // but only this will trigger our "do stuff" callback
   * network.publish("likes", 10);
   **/
  publish<K extends keyof TData>(
    key: K,
    ...args: Parameters<Subscription<TData[K]>>
  ) {
    const publisher = this.#publishers.get(key);
    publisher?.publish(...args);
    this.#followers.publish(...args);
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
   * type BlogInfo = {
   *   readers: Person[];
   *   latestReader: Person;
   *   likes: number;
   * }
   *
   * const network = new Network<BlogInfo>();
   *
   * const unfollow = network.follow((key, data) => {
   *   console.log(key);
   *   //           ^? "readers" | "latestReader" | "likes"
   *   console.log(data);
   *   //           ^? Person[] | Person | number
   * });
   *
   * // any data published here will trigger the follower,
   * // no matter which key it is publishing to
   * network.publish("latestReader", { name: "Evyatar", age: 19 });
   * network.publish("likes", 10);
   *
   * unfollow();
   *
   * // from here on, the follower will not be called
   **/
  follow(cb: Subscription<unknown>) {
    return this.#followers.subscribe(cb);
  }

  /**
   * Clear all subscribers for a specific key (A.K.A "channel" or "event")
   *
   * @param key The key to clear the subscribers of.
   **/
  clear(key: keyof TData) {
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
