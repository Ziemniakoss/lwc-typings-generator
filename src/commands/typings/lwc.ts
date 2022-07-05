import { SfdxCommand } from "@salesforce/command";
import StandardLibraryGenerator from "../../StandardLibraryGenerator";
import JsConfigGenerator from "../../JsConfigGenerator";
import LabelsTypingsGenerator from "../../LabelsTypingsGenerator";

export default class GenerateLwcTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Collective command for LWC typings generation. Generates apex, labels and stdlib typings and all required JsConfigs";

	async run() {
		this.ux.startSpinner("Generating typings for apex,stdlib and labels");
		await Promise.all([
			this.generateStdblib(),
			this.generateLabelsTypings(),
			this.generateJsConfigs(),
		]);
		this.ux.stopSpinner("done");
	}
	//TODO apex?

	private async generateStdblib() {
		return new StandardLibraryGenerator().generateStandardLibrary(
			this.project,
			this.org.getConnection()
		);
	}

	private async generateLabelsTypings() {
		return new LabelsTypingsGenerator().generateForAll(
			this.org.getConnection(),
			this.project
		);
	}

	private async generateJsConfigs() {
		return new JsConfigGenerator().generateJsConfigs(this.project);
	}
}
