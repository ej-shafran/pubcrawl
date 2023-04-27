import { Client } from "../src";

type TestingData = {
  "test-a": string;
  "test-b": number;
  "test-c": number;
  "test-d": [string, string];
};

describe("Client", () => {
  describe("Client#get", () => {
    const client = new Client<TestingData>();

    client.set("test-a", "TESTING");

    it("should get the data that exists for that key", () => {
      expect(client.get("test-a")).toEqual(["TESTING"]);
    });

    it("should return undefined if no data exists yet", () => {
      expect(client.get("test-b")).toEqual([]);
    });
  });

  describe("Client#set", () => {
    const client = new Client<TestingData>();

    client.set("test-b", 10);

    it("should create new data if none exists", () => {
      expect(client.get("test-a")).toEqual([]);
      client.set("test-a", "TESTING");
      expect(client.get("test-a")).toEqual(["TESTING"]);
    });

    it("should update any data that already exists", () => {
      expect(client.get("test-b")).toEqual([10]);
      client.set("test-b", 11);
      expect(client.get("test-b")).toEqual([11]);
    });

    it("should trigger any subscribers", () => {
      const spy = jest.fn();
      client.subscribe("test-c", spy);

      client.set("test-c", 10);
      client.set("test-c", 9);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(10);
      expect(spy).toHaveBeenCalledWith(9);
    });
  });

  describe("Client#subscribe", () => {
    const client = new Client<TestingData>();

    it("should return a callback function", () => {
      const unsub = client.subscribe("test-d", () => { });
      expect(unsub).toBeInstanceOf(Function);
    });

    it("should call the callback whenever the value is changed", () => {
      const spy = jest.fn();

      client.subscribe("test-c", spy);

      client.set("test-c", 1);
      client.set("test-c", 2);
      client.set("test-c", 3);
      client.set("test-c", 4);

      expect(spy).toHaveBeenCalledTimes(4);
      expect(spy).toHaveBeenCalledWith(1);
      expect(spy).toHaveBeenCalledWith(2);
      expect(spy).toHaveBeenCalledWith(3);
      expect(spy).toHaveBeenCalledWith(4);
    });

    it("should unsubscribe when the callback is called", () => {
      const spy = jest.fn();

      const unsub = client.subscribe("test-b", spy);

      client.set("test-b", 10);

      unsub();

      client.set("test-b", 11);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(10);
    });
  });

  describe("Client#follow", () => {
    const client = new Client<TestingData>();
    const spy = jest.fn();

    client.follow((key, ...values) => {
      spy(key, ...values);
    });

    client.set("test-a", "TESTING");
    client.set("test-b", 10);
    client.set("test-c", 11);
    client.set("test-d", ["TESTING", "TESTING"]);

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenCalledWith("test-a", "TESTING");
    expect(spy).toHaveBeenCalledWith("test-b", 10);
    expect(spy).toHaveBeenCalledWith("test-c", 11);
    expect(spy).toHaveBeenCalledWith("test-d", ["TESTING", "TESTING"]);
  });
});
