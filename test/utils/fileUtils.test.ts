import { getFileNameWithoutExtension } from "../../src/utils/filesUtils";
import * as assert from "assert";
import { join } from "path";

describe("fileUtils # getFileNameWithoutExtension", () => {
	it("should return only file name for full path", () => {
		const fileName = "MyApexClass";
		const fullPath = join(
			"force-app",
			"default",
			"something",
			`${fileName}.cls`
		);
		const result = getFileNameWithoutExtension(fullPath, ".cls");
		assert.equal(result, fileName, "Wrong string was returned");
	});
	it("should return full file if file doesn't have extension", () => {
		const fullPath = "pathWithoutExtension";
		const result = getFileNameWithoutExtension(fullPath, ".txt");
		assert.equal(result, fullPath, "Name was trimmed");
	});
	it("should return correct string even if extension has multiple dots in it", () => {
		const fullPath = join(
			"forceapp",
			"long",
			"labels",
			"mylabel.labels-meta.xml"
		);
		const result = getFileNameWithoutExtension(fullPath, ".labels-meta.xml");
		assert.equal(result, "mylabel", "failed for complex extension name");
	});
});
