import { flags, SfdxCommand } from "@salesforce/command";
import SchemaGenerator from "../../../SchemaGenerator";
import SObjectTypingsGenerator from "../../../sObjectTypingsGeneration/SObjectTypingsGenerator";
import FieldTypingsGeneratorFactory from "../../../sObjectTypingsGeneration/FieldTypingsGeneratorFactory";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateSObjectTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for SObjects";

	public static flagsConfig = {
		sobject: flags.array({
			char: "s",
			description: "Comma separated sObject names",
		}),
		depth: flags.integer({
			description:
				"Schema references depth. Bear in mind that higher values will slow down generation time",
			min: 1,
			max: 5,
			default: 1,
		}),
	};

	async run() {
		this.ux.startSpinner(
			"Generating typings for sobjects",
			"fetching describes"
		);

		this.ux.setSpinnerStatus("creating interfaces and schemas");
		const cachedConnection = new CachedConnectionWrapper(
			this.org.getConnection()
		);
		await Promise.all([
			this.generateSchemas(cachedConnection),
			this.generateTypings(cachedConnection),
		]);

		this.ux.stopSpinner("Generated");
	}

	private async generateTypings(cachedConnection: CachedConnectionWrapper) {
		return new SObjectTypingsGenerator(
			new FieldTypingsGeneratorFactory()
		).generateForProject(
			this.project,
			cachedConnection,
			false,
			this.flags.sobject
		);
	}

	private async generateSchemas(cachedConnection: CachedConnectionWrapper) {
		const depth = this.flags.depth;
		if (depth >= 4) {
			this.ux.warn(
				"Schema typings generation for high depth values can take a lot of time and generated typings can slow down autocompletion in your IDE"
			);
		}
		return new SchemaGenerator().generateForProject(
			this.project,
			cachedConnection,
			false,
			this.flags.sobject,
			depth
		);
	}
}
