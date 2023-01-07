import { SfdxCommand } from "@salesforce/command";
import { Messages } from "@salesforce/core";
import { PLUGIN_NAME } from "../../../utils/constants";
import JsConfigGenerator from "../../../generators/JsConfigGenerator";

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(PLUGIN_NAME, "clean");
export default class CleanCommand extends SfdxCommand {
	protected static requiresProject = true;
	public static description = messages.getMessage("description");

	async run() {
		this.ux.startSpinner("AA");
		const jsConfigGenerator = new JsConfigGenerator();
		await jsConfigGenerator.deleteForProject(this.project);
		await jsConfigGenerator.generateForProject(this.project);
		this.ux.stopSpinner();
	}
}
