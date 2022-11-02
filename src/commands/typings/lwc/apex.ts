import { SfdxCommand } from "@salesforce/command";
import ApexTypesGenerator from "../../../generators/ApexTypesGenerator";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Generate typings for Apex classes and aura enabled methods";

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		await new ApexTypesGenerator().generateForProject(
			this.project,
			this.org.getConnection(),
			true
		);
		this.ux.stopSpinner("have fun!");
	}
}
