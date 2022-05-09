import IFieldTypingsGenerator from "./IFieldTypingsGenerator";
import {DescribeSObjectResult, Field} from "jsforce";

export default class ReferenceFieldTypingsGenerator implements IFieldTypingsGenerator {
	generateTypings(sObjectDescribe: DescribeSObjectResult, field: Field): string {
		const joinedReferenceToApiNames = field.referenceTo
			.map((apiName) => {
				if (apiName == "RecordType") {
					return `RecordType<${sObjectDescribe.name}__RecordType__DevName>`;
				}
				return apiName;
			})
			.join(" | ");
		let typings = `\t\t${field.name}: ${joinedReferenceToApiNames};\n`;
		if (field.relationshipName != null) {
			typings += `\t\t${field.relationshipName}: (${joinedReferenceToApiNames});\n`;
		}
		return typings;
	}
}
