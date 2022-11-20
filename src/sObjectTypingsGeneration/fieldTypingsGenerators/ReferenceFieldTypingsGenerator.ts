import AFieldTypingsGenerator from "./AFieldTypingsGenerator";
import { DescribeSObjectResult, Field } from "jsforce";

export default class ReferenceFieldTypingsGenerator extends AFieldTypingsGenerator {
	generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		const joinedReferenceToApiNames = field.referenceTo
			.map((apiName) => {
				if (apiName == "RecordType") {
					return `RecordType<${sObjectDescribe.name}__RecordType__DevName>`;
				}
				return apiName;
			})
			.join(" | ");
		const jsDocs = this.generateJsDocs(sObjectDescribe, field);
		let typings = `${jsDocs}\t\t${field.name}?: apex.Id;\n`;
		if (field.relationshipName != null) {
			typings += `${jsDocs}\t\t${field.relationshipName}?: (${joinedReferenceToApiNames});\n`;
		}
		return typings;
	}
}
