import { SfdxCommand } from "@salesforce/command";
import JsConfigGenerator from "../../../generators/JsConfigGenerator";

export default class GenerateJsConfigs extends SfdxCommand {
	protected static requiresProject = true;
	public static description = "Generate proper JSConfigs";

	async run() {
		this.ux.startSpinner("Generating jsConfigs");
		await new JsConfigGenerator().generateForProject(this.project, null, false);
		this.ux.stopSpinner("generated");
	}
}
