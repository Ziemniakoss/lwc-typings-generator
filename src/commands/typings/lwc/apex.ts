import { SfdxCommand } from "@salesforce/command";
import { ApexTypingsGenerator } from "../../../apexTypingsGeneration/ApexTypingsGenerator";
import WiredMethodTypingsGenerator from "../../../apexTypingsGeneration/wiredMethodsTypingsGeneration/WiredMethodTypingsGenerator";
import ApexClassTypingsGenerator from "../../../apexTypingsGeneration/apexClassesTypingsGeneration/ApexClassTypingsGenerator";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		await new ApexTypingsGenerator(
			new WiredMethodTypingsGenerator(),
			new ApexClassTypingsGenerator()
		).generateTypingsForProject(this.org.getConnection(), this.project);
		this.ux.stopSpinner("have fun!");
	}
}
