import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";
import { TypedMap } from "./TypedMap";
import { valueof } from "./common/types/valueof";

type PublishersForObject<T> = {
  [P in keyof T]: Publisher<T[P]>;
}

export class Network<T> {
    #publishers = new TypedMap<PublishersForObject<T>>();
    #followers = new Publisher<valueof<T>>();

    subscribe<K extends keyof T>(key: K, cb: Subscription<T[K]>) {
        if (!this.#publishers.has(key)) {
            const publisher = new Publisher<T[K]>();
            const unsub = publisher.subscribe(cb);
            this.#publishers.set(key, publisher);
            return unsub;
        } else {
            const publisher = this.#publishers.get(key);
            return publisher.subscribe(cb);
        }
    }

    publish<K extends keyof T>(key: K, value: T[K]) {
        const publisher = this.#publishers.get(key);
        publisher?.publish(value);
        this.#followers.publish(value);
    }

    follow(cb: Subscription<unknown>) {
        this.#followers.subscribe(cb);
    }

    clear() {
        this.#publishers.clear();
        this.#followers.clear();
    }
}
