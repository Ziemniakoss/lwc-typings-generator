import { SfdxCommand } from "@salesforce/command";
import { HelperTypesGenerator } from "../../../generators/HelperTypesGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateHelperTypes extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Generate helper types, like salesforce.tabs namespace";

	async run() {
		this.ux.startSpinner("getting help");
		await new HelperTypesGenerator().generateForProject(
			this.project,
			new CachedConnectionWrapper(this.org.getConnection()),
			true
		);
		this.ux.stopSpinner("helper types created");
	}
}
