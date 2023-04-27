import { Network } from "../src";

type TestingEvents = {
  "test-a": string;
  "test-b": number;
  "test-c": number;
  "test-d": [string, string];
};

describe("Network", () => {
  const network = new Network<TestingEvents>();

  beforeEach(() => {
    network.fullClear();
  });

  describe("Network#subscribe", () => {
    it("should subscribe to a specific key", () => {
      network.subscribe("test-a", (data) => {
        expect(typeof data).toBe("string");
      });

      network.publish("test-a", "TESTING");
    });

    it("should return a callback function", () => {
      const spy = jest.fn();

      const unsub = network.subscribe("test-b", (data) => {
        expect(typeof data).toBe("number");
        spy(data);
      });

      expect(unsub).toBeInstanceOf(Function);

      network.publish("test-b", 10);
      unsub();
      network.publish("test-b", 11);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Network#publish", () => {
    it("should publish to specific keys", () => {
      let counter = 0;

      network.subscribe("test-c", (data) => {
        counter += data;
      });

      network.publish("test-c", 3);

      expect(counter).toBe(3);

      network.subscribe("test-d", (data) => {
        expect(data).toBeInstanceOf(Array);
        expect(data).toHaveLength(2);
      });

      network.publish("test-d", ["TESTING", "TESTING"]);
    });
  });

  describe("Network#follow", () => {
    it("should follow every result", () => {
      const spy = jest.fn();

      network.follow(spy);

      network.publish("test-a", "TESTING");
      network.publish("test-b", 10);
      network.publish("test-c", 20);
      network.publish("test-d", ["TESTING", "TESTING"]);

      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe("Network#clear", () => {
    const spy1 = jest.fn();
    const spy2 = jest.fn();
    const spy3 = jest.fn();

    network.subscribe("test-a", spy1);
    network.subscribe("test-b", spy2);
    network.follow(spy3);

    network.clear("test-a");

    network.publish("test-a", "TESTING");
    network.publish("test-b", 10);

    it("should remove all subscribers for the target key", () => {
      expect(spy1).not.toHaveBeenCalled();
    });

    it("should not affect any other keys", () => {
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    it("should not affect followers", () => {
      expect(spy3).toHaveBeenCalledTimes(2);
    });
  });
});
