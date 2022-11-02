import {
	convertToTsType,
	getInnerClassesNames,
} from "../../src/utils/apexParsingUtils";
import * as assert from "assert";
import { parseApex } from "../../lib/utils/apexParsingUtils";
import { TypeRefContext } from "apex-parser";

function getTypeRefContext(typeRefAsString: string): TypeRefContext {
	return parseApex(typeRefAsString).parser.typeRef();
}

describe("apexParsingUtils # getInnerClassesNames", () => {
	context("for class with 2 inner classes", () => {
		const classContext =
			"public class MainClass{ public class First {} public class Second {} }";
		const result = getInnerClassesNames(classContext);
		it("should return set with 2 elements", () => assert.equal(result.size, 2));
		it("should contain FirstClass", () => assert(result.has("First")));
		it("should contain SecondClass", () => assert(result.has("Second")));
	});
	context("for class without", () => {
		const classContext = "public class MainClass{}";
		const result = getInnerClassesNames(classContext);
		it("should return empty set", () => assert.equal(result.size, 0));
	});
});

describe("apexParsingUtils # convertToTsType", () => {
	context("given null value", () => {
		it("should return never", () => {
			assert.equal("never", convertToTsType(null, "", new Set(), new Map()));
		});
	});
	context("given Map", () => {
		it("should return Record implementation", () => {
			const typeRefCtx = parseApex("Map<String, String>").parser.typeRef();
			const result = convertToTsType(typeRefCtx, "", new Set(), new Map());
			assert.equal("Record<apex.String,apex.String>", result);
		});
	});
	context("given Set", () => {
		it("should return array", () => {
			const result = convertToTsType(
				getTypeRefContext("Set<Set<Integer>>"),
				"",
				new Set(),
				new Map()
			);
			assert.equal(result, "apex.Integer[][]");
		});
		//TODO
	});
	context("given inner class name", () => {
		it("should return full class name", () => {
			const typeRefCtx = parseApex("InnerClassName").parser.typeRef();
			const result = convertToTsType(
				typeRefCtx,
				"OuterClassName",
				new Set(["InnerClassName"]),
				new Map()
			);
			assert.equal("apex.OuterClassName.InnerClassName", result);
		});
	});
	context("given sObject", () => {
		it("should return type from schema namespace", () => {
			const typeRefCtx = parseApex("Account").parser.typeRef();
			const result = convertToTsType(
				typeRefCtx,
				"",
				new Set(),
				new Map([["account", "Account"]])
			);
			assert.equal(result, "schema.Account");
		});
	});
	context("given String type", () => {
		it("should return apex.String", () => {
			const result = convertToTsType(
				getTypeRefContext("sTrIng"),
				"",
				new Set(),
				new Map()
			);
			assert.equal(result, "apex.String");
		});
	});
	context("given nested lists", () => {
		it("should return array of arrays", () => {
			const result = convertToTsType(
				getTypeRefContext("List<List<String>>"),
				"",
				new Set(),
				new Map()
			);
			assert.equal(result, "apex.String[][]");
		});
	});
	context("given class from managed package", () => {
		it("should return apex.packageName.className", () => {
			const result = convertToTsType(
				getTypeRefContext("sbqq.UsageProcessingBatch"),
				"",
				new Set(),
				new Map()
			);
			assert.equal(result, "apex.sbqq.UsageProcessingBatch");
		});
	});
});
