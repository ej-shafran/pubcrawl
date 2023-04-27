import { TypedMap } from "../src";

type TestingData = {
  "test-a": string;
  "test-b": number;
  "test-c": number;
  "test-d": [string, string];
};

describe("TypedMap", () => {
  describe("new TypedMap", () => {
    it("should allow construction without an initial value", () => {
      const map = new TypedMap<TestingData>();

      expect(map.get("test-a")).toBeUndefined();
      expect(map.get("test-b")).toBeUndefined();
      expect(map.get("test-c")).toBeUndefined();
      expect(map.get("test-d")).toBeUndefined();
    });

    it("should allow passing an initialValues object", () => {
      const map = new TypedMap<TestingData>({
        "test-a": "TESTING",
        "test-b": 10,
        "test-c": 11,
        "test-d": ["TESTING", "TESTING"],
      });

      expect(map.get("test-a")).toBe("TESTING");
      expect(map.get("test-b")).toBe(10);
      expect(map.get("test-c")).toBe(11);
      expect(map.get("test-d")).toEqual(["TESTING", "TESTING"]);
    });

    it("should allow initialValues to be partial", () => {
      const map = new TypedMap<TestingData>({
        "test-a": "TESTING",
        "test-c": 11,
      });

      expect(map.get("test-a")).toBe("TESTING");
      expect(map.get("test-b")).toBeUndefined();
      expect(map.get("test-c")).toBe(11);
      expect(map.get("test-d")).toBeUndefined();
    });
  });

  describe("TypedMap#get", () => {
    const map = new TypedMap<TestingData>({ "test-a": "TESTING" });

    it("should retrieve the value placed in the TypedMap", () => {
      expect(map.get("test-a")).toBe("TESTING");
    });

    it("should return undefined if the value has not yet been set", () => {
      expect(map.get("test-d")).toBeUndefined();
    });
  });

  describe("TypedMap#set", () => {
    const map = new TypedMap<TestingData>({ "test-b": 10 });

    it("should create a new value if none exists", () => {
      expect(map.get("test-a")).toBeUndefined();
      map.set("test-a", "TESTING");
      expect(map.get("test-a")).toBe("TESTING");
    });

    it("should update any existing values", () => {
      expect(map.get("test-b")).toBe(10);
      map.set("test-b", 11);
      expect(map.get("test-b")).toBe(11);
    });
  });

  describe("TypedMap#has", () => {
    const map = new TypedMap<TestingData>({ "test-c": 11 });
    it("should return false if the key has not yet been set", () => {
      expect(map.has("test-b")).toBe(false);
    });
    it("should return true if the key has been set", () => {
      expect(map.has("test-c")).toBe(true);
    });
  });

  describe("TypedMap#keys, TypedMap#values, TypedMap#entries", () => {
    const map = new TypedMap<TestingData>({
      "test-a": "TESTING",
      "test-b": 10,
    });

    describe("keys", () => {
      const keys = [...map.keys()];

      it("should only return keys which have been set", () => {
        expect(keys).toContain("test-a");
        expect(keys).toContain("test-b");
        expect(keys).not.toContain("test-c");
        expect(keys).not.toContain("test-d");
      });
    });

    describe("values", () => {
      const values = [...map.values()];

      it("should only return values which have been set", () => {
        expect(values).toContain("TESTING");
        expect(values).toContain(10);
      });
    });

    describe("entries", () => {
      const entries = [...map.entries()];

      it("should return [key, value] tuples", () => {
        expect(entries).toContainEqual(["test-a", "TESTING"]);
        expect(entries).toContainEqual(["test-b", 10]);
      });
    });
  });

  describe("TypedMap#forEach", () => {
    const map = new TypedMap<TestingData>({
      "test-a": "TESTING",
      "test-b": 10,
      "test-c": 11,
      "test-d": ["TESTING", "TESTING"],
    });

    const spy = jest.fn();

    map.forEach((value, key) => {
      spy([value, key]);
    });

    it("should iterate over the entries of the map", () => {
      expect(spy).toHaveBeenCalledTimes(4);
      expect(spy).toHaveBeenCalledWith(["TESTING", "test-a"]);
      expect(spy).toHaveBeenCalledWith([10, "test-b"]);
      expect(spy).toHaveBeenCalledWith([11, "test-c"]);
      expect(spy).toHaveBeenCalledWith([["TESTING", "TESTING"], "test-d"]);
    });
  });
});
