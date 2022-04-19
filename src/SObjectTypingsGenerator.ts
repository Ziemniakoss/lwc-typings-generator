import { ChildRelationship, DescribeSObjectResult, Field } from "jsforce";
import { join } from "path";
import { existsSync, promises } from "fs";

export default class SObjectTypingsGenerator {
	async generateSObjectTypings(
		sObjectDescribe: DescribeSObjectResult,
		typingsFolder: string
	) {
		let typings =
			"// Generated with lwc-typings-generator\n" +
			this.generateRecordTypesTypings(sObjectDescribe) +
			this.generatePicklistsDescribe(sObjectDescribe) +
			`declare interface ${sObjectDescribe.name}`;
		if (sObjectDescribe.name == "RecordType") {
			typings += "<T>";
		}
		typings +=
			"{\n" +
			this.generateTypingForChildRelationships(
				sObjectDescribe.childRelationships
			);
		for (const field of sObjectDescribe.fields) {
			typings += this.generateTypingsForField(sObjectDescribe, field);
		}

		const folder = join(typingsFolder, "sobject_interfaces");
		if (!existsSync(folder)) {
			await promises.mkdir(folder);
		}
		return promises.writeFile(
			join(folder, `${sObjectDescribe.name}.d.ts`),
			typings + "\n}\n"
		);
	}

	generateTypingForChildRelationships(
		relationships: ChildRelationship[]
	): string {
		let typings = "";
		for (const relationship of relationships ?? []) {
			if (relationship.relationshipName != null) {
				typings += `\t${relationship.relationshipName}: ${relationship.childSObject}[];\n`;
			}
		}
		return typings;
	}

	generateTypingsForField(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		if (sObjectDescribe.name == "RecordType" && field.name == "DeveloperName") {
			return `\tDeveloperName: T;\n`;
		}
		if (field.type == "reference") {
			return this.generateTypingsForReferenceField(sObjectDescribe, field);
		}
		if (field.type == "picklist") {
			return `\t${field.name}: ${sObjectDescribe.name}__${field.name};\n`;
		}
		return `\t${field.name}: ${this.getJsType(field)};\n`;
	}

	generateTypingsForReferenceField(
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
		let typings = `\t${field.name}: ${joinedReferenceToApiNames};\n`;
		if (field.relationshipName != null) {
			typings += `\t${field.relationshipName}: (${joinedReferenceToApiNames});\n`;
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

	generatePicklistsDescribe(describe: DescribeSObjectResult): string {
		const picklistFields = describe.fields.filter(
			(field) => field.type == "picklist"
		);
		let typings = "";
		for (const field of picklistFields) {
			const mergedValues = field.picklistValues
				.map((value) => value.value)
				.map((devName) => `"${devName}"`)
				.join(" | ");
			typings += `type ${describe.name}__${field.name} = ${mergedValues};\n`;
		}
		return typings + "\n";
	}

	getJsType(field: Field): string {
		switch (field.type) {
			case "int":
			case "double":
			case "currency":
			case "percent":
				return "number";
			case "date":
				return "string | Date";
			case "datetime":
			case "base64":
			case "id":
			case "textarea":
			case "phone":
			case "url":
			case "string":
			case "email":
			case "multipicklist":
			case "location":
				return "string";
			case "boolean":
				return "boolean";
			default:
				return field.type.toString();
		}
	}
}
