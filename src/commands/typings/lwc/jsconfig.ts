import { SfdxCommand } from "@salesforce/command";
import JsConfigGenerator from "../../../JsConfigGenerator";

export default class GenerateJsConfigs extends SfdxCommand {
	protected static requiresProject = true;

	async run() {
		this.ux.startSpinner("Generating jsConfigs");
		await new JsConfigGenerator().generateJsConfigs(this.project);
		this.ux.stopSpinner("generated");
	}
}
