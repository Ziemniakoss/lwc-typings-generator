import { ChildRelationship, DescribeSObjectResult } from "jsforce";
import { join } from "path";
import { promises } from "fs";
import { mkdirs } from "../utils/filesUtils";
import AFieldTypingsGeneratorFactory from "./AFieldTypingsGeneratorFactory";
import { wrapInArray } from "../utils/collectionUtils";
import ITypingGenerator from "../generators/ITypingGenerator";
import { SfdxProject } from "@salesforce/core";
import CachedConnectionWrapper from "../utils/CachedConnectionWrapper";
import { getConfig, getTypingsDir } from "../utils/configUtils";

export default class SObjectTypingsGenerator implements ITypingGenerator {
	constructor(
		private fieldTypingsGeneratorFactory: AFieldTypingsGeneratorFactory
	) {}

	private async generateSObjectTypings(
		sObjectName: string,
		typingsFolder: string,
		connection: CachedConnectionWrapper
	) {
		const sObjectDescribe = await connection.describe(sObjectName);
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

	/**
	 * Not supported
	 */
	async deleteForFile(project: SfdxProject, filePath: string) {}

	async deleteForMetadata(project: SfdxProject, metadataFullNames: string[]) {
		//TODO
	}

	async deleteForProject(project: SfdxProject): Promise<any> {
		return Promise.resolve(undefined);
	}

	/**
	 *  Not supported
	 */
	async generateForFile(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		filePath: string
	) {}

	async generateForMetadata(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		metadataFullNames: string[]
	) {
		const typingFolder = await getTypingsDir(project);
		const generationPromises = metadataFullNames.map((name) =>
			this.generateSObjectTypings(name, typingFolder, connection)
		);
		return Promise.all(generationPromises);
	}

	async generateForProject(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		deleteExisting: boolean,
		additionalSObject?: string[]
	) {
		if (deleteExisting) {
			await this.deleteForProject(project);
		}
		const sObjectsToGenerate = new Set<string>();
		const { usedSObjectNames = {} } = await getConfig(project);
		for (const sObjectName in usedSObjectNames) {
			sObjectsToGenerate.add(sObjectName.toLowerCase());
		}
		for (const sObjectName of additionalSObject ?? []) {
			sObjectsToGenerate.add(sObjectName.toLowerCase());
		}
		return this.generateForMetadata(project, connection, [
			...sObjectsToGenerate,
		]);
	}
}
