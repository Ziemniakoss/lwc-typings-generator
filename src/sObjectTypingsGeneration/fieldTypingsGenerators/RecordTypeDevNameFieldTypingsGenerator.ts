import AFieldTypingsGenerator from "./AFieldTypingsGenerator";
import { DescribeSObjectResult, Field } from "jsforce";

export default class RecordTypeDevNameFieldTypingsGenerator extends AFieldTypingsGenerator {
	generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		return `\t\tDeveloperName: T;\n`;
	}
}
