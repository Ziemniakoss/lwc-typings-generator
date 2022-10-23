import IFieldTypingsGenerator from "./IFieldTypingsGenerator";
import { DescribeSObjectResult, Field } from "jsforce";

export default class PicklistFieldTypingsGenerator
	implements IFieldTypingsGenerator
{
	generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		const picklistValues = field.picklistValues
			.map((p) => `"${p.value}"`)
			.join(" | ");
		return `\t\t${field.name}?: ${picklistValues};\n`;
	}
}
