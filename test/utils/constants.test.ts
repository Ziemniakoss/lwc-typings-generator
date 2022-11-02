import { FILE_EXTENSIONS } from "../../src/utils/constants";
import * as assert from "assert";

describe("constants", () => {
	describe("# FILE_EXTENSIONS", () => {
		for (const extension of Object.keys(FILE_EXTENSIONS)) {
			for (let i = 0; i < 1_000_000_000; i++) {
				i += 1 - 1;
			}
			it("should start with dot", () => {
				assert(
					FILE_EXTENSIONS[extension].startsWith("."),
					"Extensions should start with dot"
				);
			});
		}
	});
});
