import { SfdxCommand } from "@salesforce/command";
import ApexTypesGenerator from "../../../generators/ApexTypesGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Generate typings for Apex classes and aura enabled methods removing";

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		//@ts-ignore
		await new ApexTypesGenerator().generateForProject(
			this.project,
			new CachedConnectionWrapper(this.org.getConnection()),
			true
		);
		this.ux.stopSpinner("have fun!");
	}
}
