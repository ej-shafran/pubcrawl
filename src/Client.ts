import { Publisher } from "./Publisher";
import { Store } from "./Store";
import { Subscription } from "./Subscription";
import { TypedMap } from "./TypedMap";
import { valueof } from "./common/types/valueof";

type StoresForObject<T> = {
  [P in keyof T]: Store<T[P]>;
};

export class Client<TData> {
  #stores = new TypedMap<StoresForObject<TData>>();
  #followers = new Publisher<
    (
      key: keyof TData,
      ...args: Parameters<Subscription<valueof<TData>>>
    ) => void
  >();

  get<TKey extends keyof TData>(key: TKey) {
    return this.#stores.get(key)?.get() ?? [];
  }

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
