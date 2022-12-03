import { SfdxCommand } from "@salesforce/command";
import UserPermissionsTypingsGenerator from "../../../UserPermissionsTypingsGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateTypingsForUserPermissions extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for user permissions";

	async run() {
		this.ux.startSpinner("Generating typings for user permissions");
		return new UserPermissionsTypingsGenerator()
			.generateTypingsForProject(
				new CachedConnectionWrapper(this.org.getConnection()),
				this.project
			)
			.then(() => this.ux.stopSpinner("stay hydrated"));
	}
}
