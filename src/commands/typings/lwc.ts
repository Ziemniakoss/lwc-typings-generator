import { SfdxCommand } from "@salesforce/command";
import StandardLibraryGenerator from "../../StandardLibraryGenerator";
import JsConfigGenerator from "../../generators/JsConfigGenerator";
import LabelsTypingsGenerator from "../../LabelsTypingsGenerator";
import { ApexTypingsGenerator } from "../../apexTypingsGeneration/ApexTypingsGenerator";
import WiredMethodTypingsGenerator from "../../apexTypingsGeneration/wiredMethodsTypingsGeneration/WiredMethodTypingsGenerator";
import ApexClassTypingsGenerator from "../../apexTypingsGeneration/apexClassesTypingsGeneration/ApexClassTypingsGenerator";
import StaticResourcesTypingGenerator from "../../StaticResourcesTypingGenerator";
import CustomPermissionsTypingsGenerator from "../../CustomPermissionsTypingsGenerator";
import UserPermissionsTypingsGenerator from "../../UserPermissionsTypingsGenerator";
import { HelperTypesGenerator } from "../../generators/HelperTypesGenerator";

export default class GenerateLwcTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static description = `Collective typings generation command.
Generates typings for:
- Apex classes and aura enabled methods
- Standard Library
- Custom Labels
- Static Resources
- Custom Permissions
- User Permissions
and generates proper JSConfigs.
`;

	async run() {
		this.ux.startSpinner("Generating LWC typings");
		await Promise.all([
			this.generateApexTypings(),
			this.generateStdblib(),
			this.generateLabelsTypings(),
			this.generateJsConfigs(),
			this.generateStaticResourcesTypings(),
			this.generateCustomPermissionsTypings(),
			this.generateUserPermsissionsTypings(),
			this.generateHelperTypes(),
		]).catch((error) => this.ux.error(error));
		this.ux.stopSpinner("done");
	}

	private async generateHelperTypes() {
		return new HelperTypesGenerator().generateForProject(
			this.project,
			this.org.getConnection(),
			false
		);
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

	private async generateCustomPermissionsTypings() {
		return new CustomPermissionsTypingsGenerator().generateTypingsForProject(
			this.org.getConnection(),
			this.project
		);
	}

	private async generateUserPermsissionsTypings() {
		return new UserPermissionsTypingsGenerator().generateTypingsForProject(
			this.org.getConnection(),
			this.project
		);
	}

	private async generateStaticResourcesTypings() {
		return new StaticResourcesTypingGenerator().generateTypingsForProject(
			this.org.getConnection(),
			this.project
		);
	}

	private async generateLabelsTypings() {
		return new LabelsTypingsGenerator().generateForAll(
			this.org.getConnection(),
			this.project
		);
	}

	private async generateJsConfigs() {
		return new JsConfigGenerator().generateForProject(this.project);
	}
}
