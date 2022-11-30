import { SfdxCommand } from "@salesforce/command";
import MessageChannelsTypingsGenerator from "../../../generators/MessageChannelsTypingsGenerator";
import CachedConnectionWrapper from "../../../utils/CachedConnectionWrapper";

export default class MessageChannelsGenerator extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = "Generate typings for message channels";

	async run() {
		this.ux.startSpinner("Generating for message channels");
		await new MessageChannelsTypingsGenerator().generateForProject(
			this.project,
			new CachedConnectionWrapper(this.org.getConnection())
		);
		this.ux.stopSpinner();
	}
}
