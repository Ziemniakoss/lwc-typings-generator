import { flags, SfdxCommand } from "@salesforce/command";
import { DescribeSObjectResult } from "jsforce";
import SchemaGenerator from "../../../SchemaGenerator";
import SObjectTypingsGenerator from "../../../sObjectTypingsGeneration/SObjectTypingsGenerator";
import FieldTypingsGeneratorFactory from "../../../sObjectTypingsGeneration/FieldTypingsGeneratorFactory";
import { getTypingsDir, mkdirs } from "../../../utils/filesUtils";
import { join } from "path";
import { appendFileSync, promises } from "fs";

export default class GenerateSObjectTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for SObjects";

	public static flagsConfig = {
		sobject: flags.string({
			char: "s",
			description: "Comma separated sObject names",
			required: true,
		}),
	};

	async run() {
		this.ux.startSpinner(
			"Generating typings for sobjects",
			"fetching describes"
		);
		const typingsFolder = await getTypingsDir(this.project);
		const schemaGenerator = new SchemaGenerator();
		const sObjectTypingsGenerator = new SObjectTypingsGenerator(
			new FieldTypingsGeneratorFactory()
		);
		const sObjects = this.flags.sobject.split(",").map((s) => s.trim());
		const describesMap = await this.fetchSObjectDefinitions(sObjects);

		this.ux.setSpinnerStatus("creating interfaces and schemas");
		await Promise.all([
			this.generateSchemas(
				sObjects,
				schemaGenerator,
				typingsFolder,
				describesMap
			),
			this.generateTypings(
				sObjects,
				sObjectTypingsGenerator,
				typingsFolder,
				describesMap
			),
			this.generateHelperSchemaTypes(typingsFolder),
		]);

		this.ux.stopSpinner("Generated");
	}

	async generateHelperSchemaTypes(typingsFolder: string) {
		const globalDescribe = await this.org.getConnection().describeGlobal();
		const schemaFolder = join(typingsFolder, "schema");
		mkdirs(schemaFolder);
		const fullPath = join(schemaFolder, "helperTypes.d.ts");

		await promises.writeFile(
			fullPath,
			"declare namespace schema {\n\tdeclare interface SObjectsMap {\n "
		);

		const sObjectDescribes = globalDescribe.sobjects;
		sObjectDescribes.forEach((sObjectDescribe, index) => {
			const apiName = sObjectDescribe.name;
			let typings = `\t\t"${apiName}": schema.${apiName}`;
			if (index != sObjectDescribes.length - 1) {
				typings += ",\n";
			} else {
				typings += "\n";
			}

			appendFileSync(fullPath, typings);
		});

		await promises.appendFile(
			fullPath,
			"\n}\n\n\tdeclare type SObjectApiName ="
		);
		sObjectDescribes.forEach((sObjectDescribe, index) => {
			const apiName = sObjectDescribe.name;
			let sObjectTypings = null;
			if (index == 0) {
				sObjectTypings = `"${apiName}"`;
			} else {
				sObjectTypings = `\n\t\t| "${apiName}"`;
			}
			appendFileSync(fullPath, sObjectTypings);
		});
		await promises.appendFile(fullPath, "\n}\n\n");
	}

	async generateTypings(
		sObjects: string[],
		sObjectTypingsGenerator: SObjectTypingsGenerator,
		typingsFolder: string,
		describesMap
	) {
		return Promise.all(
			sObjects.map((sObjectName) => {
				const describe = describesMap.get(sObjectName.toLowerCase());
				return sObjectTypingsGenerator.generateSObjectTypings(
					describe,
					typingsFolder
				);
			})
		);
	}

	async generateSchemas(
		sObjects: string[],
		schemaGenerator: SchemaGenerator,
		typingsFolder: string,
		describesMap
	) {
		return Promise.all(
			sObjects.map((sObjectName) => {
				const describe = describesMap.get(sObjectName.toLowerCase());
				const realApiName = describe.name;
				return schemaGenerator.generateSchemaTypings(
					realApiName,
					describesMap,
					typingsFolder
				);
			})
		);
	}

	async fetchSObjectDefinitions(
		sObjects: string[]
	): Promise<Map<string, DescribeSObjectResult>> {
		const describesMap = new Map();
		const describes = await Promise.all(
			sObjects.map((sObject) => this.org.getConnection().describe(sObject))
		);
		for (const describe of describes) {
			describesMap.set(describe.name.toLowerCase(), describe);
		}
		return describesMap;
	}
}
