import { Publisher } from "../src";

describe("Publisher", () => {
    const acc: string[] = [];
    const publisher = new Publisher<{ name: string }>();
    const unsub = publisher.subscribe((data) => acc.push(data.name));

    describe("Publisher#subscribe", () => {
        it("should return a callback", () => {
            expect(unsub).toBeInstanceOf(Function);
        });

        it("should handle multiple subscribers", () => {
            const localUnsub = publisher.subscribe((data) => console.log(data));
            expect(localUnsub).toBeInstanceOf(Function);
        });
    });

    describe("Publisher#publish", () => {
        publisher.publish({ name: "Evyatar" });

        it("should call its subscribers", () => {
            expect(acc.length).toEqual(1);
            expect(acc[0]).toEqual("Evyatar");
        });
    });

    describe("Publisher#unsubscribe", () => {
        unsub();
        publisher.publish({ name: "Jonathan" });

        it("should no longer call unsubbed callbacks", () => {
            expect(acc).toHaveLength(1);
        });
    });
});
