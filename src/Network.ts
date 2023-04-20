import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";

export class Network {
    #publishers = new Map<string, Publisher<any>>();
    #followers = new Publisher<unknown>();

    #handleKey = (key: string | string[]): string => {
        if (typeof key === "string") return key.split(",").join("|");

        return key.map((str) => str.split(",").join("|")).join(",");
    };

    subscribe<TData>(key: string | string[], cb: Subscription<TData>) {
        const parsed = this.#handleKey(key);
        if (!this.#publishers.has(parsed)) {
            const publisher = new Publisher<TData>();
            const unsub = publisher.subscribe(cb);
            this.#publishers.set(parsed, publisher);
            return unsub;
        } else {
            const publisher = this.#publishers.get(parsed) as Publisher<TData>;
            return publisher.subscribe(cb);
        }
    }

    publish<TData>(key: string | string[], value: TData) {
        const parsed = this.#handleKey(key);
        const publisher = this.#publishers.get(parsed) as Publisher<TData> | undefined;
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
