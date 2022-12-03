import { SfdxCommand } from "@salesforce/command";
import StaticResourcesTypingGenerator from "../../../StaticResourcesTypingGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateTypingsForStaticResources extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for static resources";

	async run() {
		this.ux.startSpinner("Generating typings for static resources");
		return new StaticResourcesTypingGenerator()
			.generateTypingsForProject(
				new CachedConnectionWrapper(this.org.getConnection()),
				this.project
			)
			.then(() => this.ux.stopSpinner("have a great day!"));
	}
}
