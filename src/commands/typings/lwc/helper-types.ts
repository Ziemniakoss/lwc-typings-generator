import { SfdxCommand } from "@salesforce/command";
import { HelperTypesGenerator } from "../../../HelperTypesGenerator";

export default class GenerateHelperTypes extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Generate helper types, like salesforce.tabs namespace";

	async run() {
		this.ux.startSpinner("getting help");
		await new HelperTypesGenerator().generateTypingsForProject(
			this.org.getConnection(),
			this.project
		);
		this.ux.stopSpinner("helper types created");
	}
}
