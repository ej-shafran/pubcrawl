import { Publisher } from "./Publisher";
import { Store } from "./Store";
import { Subscription } from "./Subscription";
import { TypedMap } from "./TypedMap";
import { valueof } from "./common/types/valueof";

type StoresForObject<T> = {
  [P in keyof T]: Store<T[P]>;
};

/**
 * Keeps track of multiple different stores of data,
 * and allows subscription and updates to specific stores by key.
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
 * const client = new Client<BlogInfo>();
 *
 * const unsub = client.subscribe("readers", (people) => {
 *   // do stuff with the `person` array (`people`) here
 * });
 *
 * // update the internal state for a specifc key and notify all that key's subscribers
 * client.set("readers", [{ name: "Evyatar", age: 19 }]);
 *
 * // get the current state within an array
 * const [people] = client.get("readers");
 *
 * // remove the subscriber we set up
 * unsub();
 *
 * // if a key of `TData` is a function
 * type Events = {
 *   load: () => void;
 *   click: (x: number, y: number) => void;
 * }
 *
 * const client = new Client<Events>();
 * // we'll be expected to pass the parameters of that function for that key's setters
 * client.set("click", 10, 20);
 * // and that's also what `subscribe`'s callbacks will get
 * client.subscribe("click", (x, y) => {
 *   // do stuff here...
 * })
 * // and what `get` will return
 * const [x, y] = client.get("click");
 **/
export class Client<TData> {
  #stores = new TypedMap<StoresForObject<TData>>();
  #followers = new Publisher<
    (
      key: keyof TData,
      ...args: Parameters<Subscription<valueof<TData>>>
    ) => void
  >();

  /**
   * Keeps track of multiple different stores of data,
   * and allows subscription and updates to specific stores by key.
   **/
  constructor() { }

  /**
   * Get a snapshot of a specific store's current state.
   *
   * @param key The key of the store to return the data from.
   *
   * @returns the data currently being held at the store for `key`, **as an array**; an empty array is returned if no data has been set for that key yet.
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
   * const client = new Client<BlogInfo>();
   *
   * // `data` will be an empty array
   * let data = client.get("latestReader");
   *
   * client.set("latestReader", { name: "Evyatar", age: 19 });
   *
   * // `data` will be `[{ name: "Evyatar", age: 19 }]`
   * data = client.get();
   **/
  get<TKey extends keyof TData>(key: TKey) {
    return this.#stores.get(key)?.get() ?? [];
  }

  /**
   * Update a specific store's state with new data, and notify all subscribers of that store, along with any followers.
   *
   * @param key The key of the store for which to update the data.
   * @param args The new data to keep within that store.
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
   * const client = new Client<BlogInfo>();
   *
   * client.subscribe("readers", (people) => {
   *   // do stuff with the `person` array...
   * })
   *
   * // these calls will:
   * // a) trigger all subscribers for their keys
   * // b) update the state for any `get` calls with that key
   * // c) trigger all followers
   * client.set("readers", [{ name: "Evyatar", age: 19 }]);
   * client.set("latestReader", { name: "John", age: 27 });
   * client.set("likes", 10);
   **/
  set<TKey extends keyof TData>(
    key: TKey,
    ...args: Parameters<Subscription<TData[TKey]>>
  ) {
    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;
      store.set(...args);
    } else {
      const store = new Store<TData[TKey]>(...args);
      this.#stores.set(key, store);
    }

    this.#followers.publish(key, ...args);
  }

  /**
   * Add a new subscriber to a specific store.
   *
   * @param key The specific key/store to subscribe to.
   * @param cb Will be called whenever new data is updated for the store specified by `key`.
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
   * const client = new Client<BlogInfo>();
   *
   * // we subscribe to a specific store within the client
   * const unsub = client.subscribe("readers", (person) => {
   *   console.log(person);
   *   //           ^? Person[]
   * })
   *
   * // any `set` calls to "readers" here will trigger our `console.log`...
   * unsub();
   * // but any `set` calls to "readers" from here on out will not
   **/
  subscribe<TKey extends keyof TData>(
    key: TKey,
    cb: Subscription<TData[TKey]>
  ) {
    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;
      return store.subscribe(cb);
    } else {
      const store = new Store<TData[TKey]>();
      const unsub = store.subscribe(cb);
      this.#stores.set(key, store);
      return unsub;
    }
  }

  /**
   * Add a "follower", which listens to data published to every store.
   *
   * @param cb Will be called whenever data is updated for **any** of the client's stores.
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
   * const client = new Client<BlogInfo>();
   *
   * const unfollow = client.follow((key, data) => {
   *   console.log(key);
   *   //           ^? "readers" | "latestReader" | "likes"
   *   console.log(data);
   *   //           ^? Person[] | Person | number
   * });
   *
   * // any data updated here will trigger the follower,
   * // no matter which store it is updating
   * client.set("latestReader", { name: "Evyatar", age: 19 });
   * client.set("likes", 10);
   *
   * unfollow();
   *
   * // from here on, the follower will not be called
   **/
  follow(
    cb: Subscription<
      (
        key: keyof TData,
        ...args: Parameters<Subscription<valueof<TData>>>
      ) => void
    >
  ) {
    return this.#followers.subscribe(cb);
  }
}
