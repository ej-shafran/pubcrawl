import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";

export class Store<TData> {
    #publisher = new Publisher<TData>();
    #value: TData;

    constructor(initialValue: TData) {
        this.#value = initialValue;
    }

    set(newValue: TData) {
        this.#value = newValue;
        this.#publisher.publish(newValue);
    }

    get() {
        return this.#value;
    }

    subscribe(cb: Subscription<TData>) {
        return this.#publisher.subscribe(cb);
    }
}
