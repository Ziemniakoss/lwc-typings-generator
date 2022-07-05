import { SfdxCommand } from "@salesforce/command";
import StandardLibraryGenerator from "../../StandardLibraryGenerator";
import JsConfigGenerator from "../../JsConfigGenerator";
import LabelsTypingsGenerator from "../../LabelsTypingsGenerator";
import { ApexTypingsGenerator } from "../../apexTypingsGeneration/ApexTypingsGenerator";
import WiredMethodTypingsGenerator from "../../apexTypingsGeneration/wiredMethodsTypingsGeneration/WiredMethodTypingsGenerator";
import ApexClassTypingsGenerator from "../../apexTypingsGeneration/apexClassesTypingsGeneration/ApexClassTypingsGenerator";

export default class GenerateLwcTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description =
		"Collective command for LWC typings generation. Generates apex, labels and stdlib typings and all required JsConfigs";

	async run() {
		this.ux.startSpinner("Generating typings for apex,stdlib and labels");
		await Promise.all([
			this.generateApexTypings(),
			this.generateStdblib(),
			this.generateLabelsTypings(),
			this.generateJsConfigs(),
		]);
		this.ux.stopSpinner("done");
	}
	private async generateApexTypings() {
		return new ApexTypingsGenerator(
			new WiredMethodTypingsGenerator(),
			new ApexClassTypingsGenerator()
		).generateTypingsForProject(this.org.getConnection(), this.project);
	}

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
