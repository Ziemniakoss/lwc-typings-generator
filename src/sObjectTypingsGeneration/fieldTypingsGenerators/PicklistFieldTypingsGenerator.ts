import AFieldTypingsGenerator from "./AFieldTypingsGenerator";
import { DescribeSObjectResult, Field } from "jsforce";

export default class PicklistFieldTypingsGenerator extends AFieldTypingsGenerator {
	generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		const picklistValues = field.picklistValues
			.map((p) => `"${p.value}"`)
			.join(" | ");
		return `${this.generateJsDocs(sObjectDescribe, field)}\t\t${
			field.name
		}?: ${picklistValues};\n`;
	}
}
