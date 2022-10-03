import { FILE_EXTENSIONS } from "../../src/utils/constants";
import * as assert from "assert";

describe("constants # file extensions", () => {
	for (const extension of Object.keys(FILE_EXTENSIONS)) {
		it("should start with dot", () => {
			assert(
				FILE_EXTENSIONS[extension].startsWith("."),
				"Extensions should start with dot"
			);
		});
	}
});
