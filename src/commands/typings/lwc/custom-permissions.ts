import { SfdxCommand } from "@salesforce/command";
import CustomPermissionsTypingsGenerator from "../../../CustomPermissionsTypingsGenerator";

export default class GenerateTypingsForCustomPermissions extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for custom permissions";

	async run() {
		this.ux.startSpinner("Generating typings for custom permissions");
		return new CustomPermissionsTypingsGenerator()
			.generateTypingsForProject(this.org.getConnection(), this.project)
			.then(() => this.ux.stopSpinner("lookin good"));
	}
}
