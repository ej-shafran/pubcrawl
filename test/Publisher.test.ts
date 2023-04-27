import { Publisher } from "../src";

type TestingData = {
  name: string;
  age: number;
};

describe("Publisher", () => {
  describe("Publisher#subscribe, Publisher#publish", () => {
    it("should return a callback", () => {
      const publisher = new Publisher<TestingData>();
      const unsub = publisher.subscribe(() => { });
      expect(unsub).toBeInstanceOf(Function);
    });

    it("should call the subscriber on each publish", () => {
      const publisher = new Publisher<TestingData>();
      const spy = jest.fn();

      publisher.subscribe(spy);

      publisher.publish({ age: 19, name: "Evyatar" });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ age: 19, name: "Evyatar" });
    });
  });

  describe("Publisher#clear", () => {
    it("should remove all subscribers", () => {
      const publisher = new Publisher<TestingData>();

      const spy1 = jest.fn();
      const spy2 = jest.fn();

      publisher.subscribe(spy1);
      publisher.subscribe(spy2);

      publisher.clear();

      publisher.publish({ age: 19, name: "Evyatar" });

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });
  });

  describe("Publisher of a function", () => {
    it("should publish the function's parameters", () => {
      const publisher = new Publisher<(name: string, age: number) => void>();
      const spy = jest.fn();

      publisher.subscribe((name, age) => {
        expect(typeof name).toBe("string");
        expect(typeof age).toBe("number");
        spy();
      });

      publisher.publish("Evyatar", 19);
      publisher.publish("Yair", 16);
      publisher.publish("Yonatan", 13);
      publisher.publish("Itamar", 10);

      expect(spy).toHaveBeenCalledTimes(4);
    });
  });
});
