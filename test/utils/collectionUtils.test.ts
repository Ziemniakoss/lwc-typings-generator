import {
	splitIntoSubArrays,
	wrapInArray,
} from "../../lib/utils/collectionUtils";
import * as assert from "assert";

describe("collectionUtils", () => {
	describe("splitIntoSubArrays", () => {
		it("should return same array for max == length", () => {
			const array = [1, 2, 3, 4, 5];
			const result = splitIntoSubArrays(array, array.length);
			assert.deepStrictEqual(result, [array], "Same array should be returned");
		});
		it("should return multiple arrays for max < length", () => {
			const expected = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10],
			];
			const result = splitIntoSubArrays(expected.flat(), 4);
			assert.deepStrictEqual(result, expected, "Array wasn't split correctly");
		});
	});
	describe("wrapInArray", () => {
		it("should return empty array for null", () => {
			const result = wrapInArray(null);
			assert(Array.isArray(result), "returned value wasn't array typed");
			assert.equal(result.length, 0, "Array should be empty");
		});
		it("should return passed object if it was array", () => {
			const arr = [1, 2, 3];
			const result = wrapInArray(arr);
			assert.deepStrictEqual(
				result,
				arr,
				"Returned array wasn't the same as input"
			);
		});
		it("should return wrapped object if it wasn't array", () => {
			const obj = { fieldName: "someValue" };
			const result = wrapInArray(obj);
			assert.deepStrictEqual(result, [obj]);
		});
	});
});
