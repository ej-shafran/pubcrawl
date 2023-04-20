import { Network } from "../src";

describe("Network", () => {
    const network = new Network();

    beforeEach(() => {
        network.clear();
    });

    describe("Network#subscribe", () => {
        it("should subscribe to a specific key", () => {
            network.subscribe<string>("test-a", (data) => {
                expect(typeof data).toBe("string");
            });

            network.publish("test-a", "TESTING");
        });

        it("should allow an array of strings as a key", () => {
            network.subscribe<{ name: string }>(["test-b", "test-c"], (data) => {
                expect(data).toEqual({ name: "TESTING" });
            });

            network.publish(["test-b", "test-c"], { name: "TESTING" });
        });

        it("should allow multiple subscribers for the same key", () => {
            const accumulator: string[] = [];

            network.subscribe<string>(["test-d", "test-e"], (data) => {
                accumulator.push(data);
            });
            network.subscribe<string>(["test-d", "test-e"], (data) => {
                accumulator.push(data);
            });

            network.publish(["test-d", "test-e"], "foo");

            expect(accumulator).toHaveLength(2);
        });

        it("should allow commas within a string without confusion", () => {
            const accumulator: string[] = [];

            network.subscribe<string>(["test-f", "test-g"], (data) => {
                accumulator.push(data);
            });

            network.subscribe<{ name: string }>("test-f,test-g", (data) => {
                accumulator.push(data.name);
            });

            network.publish("test-f,test-g", { name: "foo" });

            expect(accumulator).toHaveLength(1);
        });

        it("should return a callback", () => {
            const unsub = network.subscribe("test-h", () => {});

            expect(unsub).toBeInstanceOf(Function); });
    });

    describe("Network#publish", () => {
        it("should publish to specific keys", () => {
            let counter = 0;

            network.subscribe<number>("test-i", (data) => {
                counter += data;
            });

            network.publish("test-i", 3);

            expect(counter).toBe(3);

            network.subscribe<string[]>("test-j", (data) => {
                expect(data).toBeInstanceOf(Array);
                expect(data).toHaveLength(2);
            });

            network.publish("test-j", ["TESTING", "TESTING"]);
        });
    });

    describe("Network#follow", () => {
        it("should follow every result", () => {
            const followerAcc: unknown[] = [];

            network.follow((data) => {
                followerAcc.push(data);
            });

            network.subscribe("test-k", () => {});
            network.subscribe("test-l", () => {});
            network.subscribe("test-m", () => {});
            network.publish("test-k", "hi");
            network.publish("test-l", "hi");
            network.publish("test-m", "hi");

            expect(followerAcc).toHaveLength(3);
        });
    });
});
