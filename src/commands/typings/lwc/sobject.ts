import { flags, SfdxCommand } from "@salesforce/command";
import { DescribeSObjectResult } from "jsforce";
import SchemaGenerator from "../../../SchemaGenerator";
import SObjectTypingsGenerator from "../../../sObjectTypingsGeneration/SObjectTypingsGenerator";
import FieldTypingsGeneratorFactory from "../../../sObjectTypingsGeneration/FieldTypingsGeneratorFactory";
import { getTypingsDir } from "../../../utils/filesUtils";

export default class GenerateSObjectTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for SObjects";

	public static flagsConfig = {
		sobject: flags.array({
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
		const sObjects = this.flags.sobject.map((s) => s.trim());
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

	async generateHelperSchemaTypes(typingsFolder: string) {}

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
