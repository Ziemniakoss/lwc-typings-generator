import { Field } from "jsforce";
import { join } from "path";
import { promises } from "fs";
import { mkdirs } from "./utils/filesUtils";
import ITypingGenerator from "./generators/ITypingGenerator";
import { SfdxProject } from "@salesforce/core";
import CachedConnectionWrapper from "./utils/CachedConnectionWrapper";
import { getConfig, getTypingsDir } from "./utils/configUtils";

const MAX_SCHEMA_DEPTH = 5;

type PossibleDepths = 1 | 2 | 3 | 4 | 5;
export default class SchemaGenerator implements ITypingGenerator {
	private async generateTypingsForSObject(
		sObjectName: string,
		connection: CachedConnectionWrapper,
		schemaTypingsFolder: string,
		maxGenerationDepth:PossibleDepths
	) {
		const sObjectDescribe = await connection.describe(sObjectName);
		const sObjectApiName = sObjectDescribe.name;

		const fileName = join(schemaTypingsFolder, `${sObjectApiName}.d.ts`);
		let typings = `
declare module "@salesforce/schema/${sObjectApiName}" {
	const ${sObjectApiName}: schema.ObjectIdFromSchema<"${sObjectApiName}">;
	export default ${sObjectApiName}
}\n`;
		await promises.writeFile(fileName, typings);
		for (const field of sObjectDescribe.fields) {
			await this.generateTypingsForField(
				field,
				sObjectApiName,
				sObjectApiName,
				1,
				connection,
				fileName,
				maxGenerationDepth
			);
		}
	}

	private async generateTypingsForField(
		field: Field,
		sObjectName: string,
		prefix: string,
		currentDepth: number,
		connection: CachedConnectionWrapper,
		fileName: string,
		maxGenerationDepth:PossibleDepths
	) {
		if (currentDepth > maxGenerationDepth) {
			return "";
		}
		const moduleName = `${prefix}.${field.name}`;
		const varName = moduleName.split(".").join("_");
		let fieldDocs = "";
		if (field.inlineHelpText != null) {
			fieldDocs = `/**\n${field.inlineHelpText}\n*/\n`;
		}
		const fieldTypings =
			fieldDocs +
			`
declare module "@salesforce/schema/${moduleName}" {
	const ${varName}: schema.FieldIdFromSchema<"${sObjectName}", "${field.name}">
	export default ${varName}
}\n`;
		await promises.appendFile(fileName, fieldTypings);
		if (field.type !== "reference") {
			return fieldTypings;
		}
		const referencedFieldPrefix = `${prefix}.${field.relationshipName}`;
		const relatedTypingsGenerationPromises = field.referenceTo.map(
			(referencedType) =>
				this.generateTypingsForReferencedSObject(
					referencedType,
					referencedFieldPrefix,
					currentDepth + 1,
					connection,
					fileName,
					maxGenerationDepth
				)
		);
		return Promise.all(relatedTypingsGenerationPromises);
	}

	private async generateTypingsForReferencedSObject(
		referencedSObjectName: string,
		parentModuleName: string,
		currentDepth: number,
		connection: CachedConnectionWrapper,
		fileName: string,
		maxGenerationDepth:PossibleDepths
	) {
		if (currentDepth > maxGenerationDepth) {
			return;
		}
		const sObjectDescribe = await connection.describe(referencedSObjectName);
		for (const field of sObjectDescribe.fields) {
			await this.generateTypingsForField(
				field,
				referencedSObjectName,
				parentModuleName,
				currentDepth,
				connection,
				fileName,
				maxGenerationDepth
			);
		}
	}

	async getSchemaFolder(project: SfdxProject): Promise<string> {
		const typingsFolder = await getTypingsDir(project);
		const folder = join(typingsFolder, "schema");
		mkdirs(folder);
		return folder;
	}

	/**
	 * This operation is unsupported
	 */
	async deleteForFile(project: SfdxProject, filePath: string) {}

	async deleteForMetadata(
		project: SfdxProject,
		metadataFullNames: string[]
	): Promise<any> {
		return Promise.resolve(undefined);
	}

	async deleteForProject(project: SfdxProject) {
		return promises.rm(await this.getSchemaFolder(project), {
			recursive: true,
			force: true,
		});
	}

	/**
	 * This operation is unsupported
	 */
	async generateForFile(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		filePath: string
	) {
		return Promise.resolve(undefined);
	}

	async generateForMetadata(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		metadataFullNames: string[],
		maxGenerationDepth?:PossibleDepths
	): Promise<any> {
		const schemaTypingsFolder = await this.getSchemaFolder(project);
		//@ts-ignore
		maxGenerationDepth = Math.min(MAX_SCHEMA_DEPTH, Math.max(maxGenerationDepth, 0))
		const generationPromises = metadataFullNames.map((sObjectApiName) =>
			this.generateTypingsForSObject(
				sObjectApiName,
				connection,
				schemaTypingsFolder,
				maxGenerationDepth
			)
		);
		return Promise.all(generationPromises);
	}

	/**
	 * Generates typings for sObject declared in generator config
	 *
	 * @param project project for which typings should be generated
	 * @param connection cached connection
	 * @param deleteExisting should exisiting typings be deleted
	 * @param [additionalSObjectApiNames] additional SObject api names that schemes should be generated
	 *
	 * @return array of SObject names that typings were generated for *in lower case*.
	 */
	async generateForProject(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		deleteExisting: boolean,
		additionalSObjectApiNames?: string[],
		maxGenerationDepth?:PossibleDepths
	) {
		if (deleteExisting) {
			await this.deleteForProject(project);
		}
		let { usedSObjectNames ={} } = await getConfig(project);

		const fullNamesToGenerate = new Set<string>();
		for (const sObjectApiName of Object.keys(usedSObjectNames)) {
			fullNamesToGenerate.add(sObjectApiName.toLowerCase());
		}
		for (const sObjectApiName of additionalSObjectApiNames ?? []) {
			fullNamesToGenerate.add(sObjectApiName.toLowerCase());
		}
		await this.generateForMetadata(project, connection, [
			...fullNamesToGenerate,
		], maxGenerationDepth);
	}
}
