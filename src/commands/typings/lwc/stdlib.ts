import { SfdxCommand } from "@salesforce/command";
import StandardLibraryGenerator from "../../../StandardLibraryGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class GenerateStdLib extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for standard library";

	async run() {
		const project = this.project;
		const connection = new CachedConnectionWrapper(this.org.getConnection());
		return new StandardLibraryGenerator().generateStandardLibrary(
			project,
			connection
		);
	}
}
