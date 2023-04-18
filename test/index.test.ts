import { isTestWorking } from "../src";

describe("is test working", () => {
    it("should work!", () => {
        expect(isTestWorking()).toBe(true);
    });
});
