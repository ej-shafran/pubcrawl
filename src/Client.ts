import { Publisher } from "./Publisher";
import { Store } from "./Store";
import { Subscription } from "./Subscription";
import { TypedMap } from "./TypedMap";
import { valueof } from "./common/types/valueof";

type StoresForObject<T> = {
  [P in keyof T]: Store<T[P]>;
};

export class Client<T> {
  #stores = new TypedMap<StoresForObject<T>>();
  #followers = new Publisher<
    (key: keyof T, ...args: Parameters<Subscription<valueof<T>>>) => void
  >();

  get<K extends keyof T>(key: K) {
    return this.#stores.get(key)?.get() ?? [];
  }

  set<K extends keyof T>(key: K, ...args: Parameters<Subscription<T[K]>>) {
    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;
      store.set(...args);
    } else {
      const store = new Store<T[K]>(...args);
      this.#stores.set(key, store);
    }

    this.#followers.publish(key, ...args);
  }

  subscribe<K extends keyof T>(key: K, cb: Subscription<T[K]>) {
    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;
      return store.subscribe(cb);
    } else {
      const store = new Store<T[K]>();
      const unsub = store.subscribe(cb);
      this.#stores.set(key, store);
      return unsub;
    }
  }

  follow(
    cb: Subscription<
      (key: keyof T, ...args: Parameters<Subscription<valueof<T>>>) => void
    >
  ) {
    return this.#followers.subscribe(cb);
  }
}
