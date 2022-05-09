import {ChildRelationship, DescribeSObjectResult } from "jsforce";
import {join} from "path";
import {promises} from "fs";
import {mkdirs} from "../utils/filesUtils";
import IFieldTypingsGeneratorFactory from "./IFieldTypingsGeneratorFactory";

export default class SObjectTypingsGenerator {
	constructor(private fieldTypingsGeneratorFactory: IFieldTypingsGeneratorFactory) {
	}

	async generateSObjectTypings(
		sObjectDescribe: DescribeSObjectResult,
		typingsFolder: string
	) {
		let typings =
			"// Generated with lwc-typings-generator\ndeclare namespace schema {\n" +
			this.generateRecordTypesTypings(sObjectDescribe) +
			`\tdeclare interface ${sObjectDescribe.name}`;
		if (sObjectDescribe.name == "RecordType") {
			typings += "<T>";
		}
		typings +=
			"{\n" +
			this.generateTypingForChildRelationships(
				sObjectDescribe.childRelationships
			);
		for (const field of sObjectDescribe.fields) {
			const fieldTypingsGenerator = this.fieldTypingsGeneratorFactory.getFieldTypingsGenerator(sObjectDescribe, field)
			typings += fieldTypingsGenerator.generateTypings(sObjectDescribe, field);
		}

		const folder = join(typingsFolder, "sobject_interfaces");
		mkdirs(folder)
		return promises.writeFile(
			join(folder, `${sObjectDescribe.name}.d.ts`),
			typings + "\n\t}\n}\n"
		);
	}

	generateTypingForChildRelationships(
		relationships: ChildRelationship[]
	): string {
		let typings = "";
		for (const relationship of relationships ?? []) {
			if (relationship.relationshipName != null) {
				typings += `\t\t${relationship.relationshipName}: ${relationship.childSObject}[];\n`;
			}
		}
		return typings;
	}

	generateRecordTypesTypings(describe: DescribeSObjectResult): string {
		let devNamesMerged = describe.recordTypeInfos
			.map((rtInfo) => rtInfo.developerName)
			.map((devName) => `"${devName}"`)
			.join(" | ");
		return `type ${describe.name}__RecordType__DevName = ${devNamesMerged};\n\n`;
	}
}
