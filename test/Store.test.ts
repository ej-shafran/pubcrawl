import { Store } from "../src";

describe("Store", () => {
  const acc: string[] = [];
  const store = new Store({ name: "" });
  const unsub = store.subscribe((data) => acc.push(data.name));

  const initialValue = store.get();

  describe("Store#get", () => {
    it("should return the value inside the store", () => {
      expect(initialValue).toEqual([{ name: "" }]);
    });
  });

  describe("Store#subscribe", () => {
    it("should return a callback", () => {
      expect(unsub).toBeInstanceOf(Function);
    });

    it("should handle multiple subscriptions", () => {
      const localUnsub = store.subscribe((data) => console.log(data));
      expect(localUnsub).toBeInstanceOf(Function);
    });
  });

  describe("Store#set", () => {
    store.set({ name: "Evyatar" });

    it("should change the value in the store", () => {
      expect(store.get()).toEqual([{ name: "Evyatar" }]);
    });

    it("should call the store's subscribers", () => {
      expect(acc).toHaveLength(1);
    });
  });
});
