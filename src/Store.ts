import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";

export class Store<TData> {
    #publisher = new Publisher<TData>();
    #value: Parameters<Subscription<TData>> | [];

    constructor(...args: Parameters<Subscription<TData>> | []) {
        this.#value = args;
    }

    set(...args: Parameters<Subscription<TData>>) {
        this.#value = args;
        this.#publisher.publish(...args);
    }

    get() {
        return this.#value;
    }

    subscribe(cb: Subscription<TData>) {
        return this.#publisher.subscribe(cb);
    }
}

