import { flags, SfdxCommand } from "@salesforce/command";
import { DescribeSObjectResult } from "jsforce";
import SchemaGenerator from "../../../SchemaGenerator";
import SObjectTypingsGenerator from "../../../sObjectTypingsGeneration/SObjectTypingsGenerator";
import FieldTypingsGeneratorFactory from "../../../sObjectTypingsGeneration/FieldTypingsGeneratorFactory";
import { getTypingsDir } from "../../../utils/configUtils";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

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
		depth: flags.integer({
			description: "Schema references depth. Bear in mind that higher values will slow down generation time",
			min: 1,
			max: 5,
			default:1
		})
	};

	async run() {
		this.ux.startSpinner(
			"Generating typings for sobjects",
			"fetching describes"
		);
		const typingsFolder = await getTypingsDir(this.project);
		const sObjectTypingsGenerator = new SObjectTypingsGenerator(
			new FieldTypingsGeneratorFactory()
		);
		const sObjects = this.flags.sobject.map((s) => s.trim());
		const describesMap = await this.fetchSObjectDefinitions(sObjects);

		this.ux.setSpinnerStatus("creating interfaces and schemas");
		await Promise.all([
			this.generateSchemas(),
			this.generateTypings(
				sObjects,
				sObjectTypingsGenerator,
				typingsFolder,
				describesMap
			),
		]);

		this.ux.stopSpinner("Generated");
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

	async generateSchemas() {
		const depth = this.flags.depth
		if(depth == 5){
			this.ux.warn("Schema typings generation for high depth values can take a lot of time and generated typings can slow down autocompletion in your IDE")
		}
		return new SchemaGenerator().generateForProject(
			this.project,
			new CachedConnectionWrapper(this.org.getConnection()),
			false,
			this.flags.sobject,
			depth
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
