import { ChildRelationship, DescribeSObjectResult } from "jsforce";
import { join } from "path";
import { promises } from "fs";
import { mkdirs } from "../utils/filesUtils";
import AFieldTypingsGeneratorFactory from "./AFieldTypingsGeneratorFactory";
import { wrapInArray } from "../utils/collectionUtils";

export default class SObjectTypingsGenerator {
	constructor(
		private fieldTypingsGeneratorFactory: AFieldTypingsGeneratorFactory
	) {}

	async generateSObjectTypings(
		sObjectDescribe: DescribeSObjectResult,
		typingsFolder: string
	) {
		let typings =
			"// Generated with lwc-typings-generator\ndeclare namespace schema {\n" +
			this.generateRecordTypesTypings(sObjectDescribe) +
			`\tdeclare interface ${sObjectDescribe.name}`;
		const isRecordType = sObjectDescribe.name == "RecordType";
		if (isRecordType) {
			typings += "<T>";
		}
		typings +=
			"{\n" +
			this.generateTypingForChildRelationships(
				sObjectDescribe.childRelationships
			);
		for (const field of sObjectDescribe.fields) {
			const fieldTypingsGenerator =
				this.fieldTypingsGeneratorFactory.getFieldTypingsGenerator(
					sObjectDescribe,
					field
				);
			typings += fieldTypingsGenerator.generateTypings(sObjectDescribe, field);
		}
		if (!isRecordType) {
			typings += this.generateRecordTypeTypings(sObjectDescribe);
		}

		const folder = join(typingsFolder, "sobject_interfaces");
		mkdirs(folder);
		return promises.writeFile(
			join(folder, `${sObjectDescribe.name}.d.ts`),
			typings + "\n\t}\n}\n"
		);
	}

	private generateRecordTypeTypings(sObjectDescribe: DescribeSObjectResult) {
		return `\t\tRecordTypeId?: apex.Id;\n\t\tRecordType?:schema.RecordType<${sObjectDescribe.name}__RecordType__DevName>`;
	}

	private generateTypingForChildRelationships(
		relationships: ChildRelationship[]
	): string {
		let typings = "";
		for (const relationship of relationships ?? []) {
			if (relationship.relationshipName != null) {
				typings += `\t\t${relationship.relationshipName}?: ${relationship.childSObject}[];\n`;
			}
		}
		return typings;
	}

	private generateRecordTypesTypings(describe: DescribeSObjectResult): string {
		const typeDefinition = `\ttype ${describe.name}__RecordType__DevName =`;

		const recordTypeInfos = wrapInArray(describe.recordTypeInfos);
		if (recordTypeInfos.length == 0) {
			return typeDefinition + " any;\n\n";
		}
		const devNamesMerged = describe.recordTypeInfos
			.map((rtInfo) => rtInfo.developerName)
			.map((devName) => `\t\t"${devName}"`)
			.join(" |\n");
		return typeDefinition + "\n" + devNamesMerged + ";\n\n";
	}
}
