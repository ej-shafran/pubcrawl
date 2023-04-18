import { Subscription } from "./Subscription";

export class Publisher<TData> {
    #subscribers = new Set<Subscription<TData>>();

    subscribe(cb: Subscription<TData>) {
        this.#subscribers.add(cb);

        return () => {
            this.#subscribers.delete(cb);
        };
    }

    publish(data: TData) {
        this.#subscribers.forEach((cb) => {
            cb(data);
        });
    }
}
