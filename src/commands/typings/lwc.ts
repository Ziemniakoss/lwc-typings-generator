import { SfdxCommand } from "@salesforce/command";
import StandardLibraryGenerator from "../../StandardLibraryGenerator";
import JsConfigGenerator from "../../generators/JsConfigGenerator";
import LabelsTypingsGenerator from "../../LabelsTypingsGenerator";
import StaticResourcesTypingGenerator from "../../StaticResourcesTypingGenerator";
import CustomPermissionsTypingsGenerator from "../../CustomPermissionsTypingsGenerator";
import UserPermissionsTypingsGenerator from "../../UserPermissionsTypingsGenerator";
import { HelperTypesGenerator } from "../../generators/HelperTypesGenerator";
import ApexTypesGenerator from "../../generators/ApexTypesGenerator";
import CachedConnectionWrapper from "../../utils/CachedConnectionWrapper";
import SObjectTypingsGenerator from "../../sObjectTypingsGeneration/SObjectTypingsGenerator";
import FieldTypingsGeneratorFactory from "../../sObjectTypingsGeneration/FieldTypingsGeneratorFactory";
import SchemaGenerator from "../../SchemaGenerator";

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
			this.generateSObjectSchema(),
			this.generateSObjectTypings(),
			this.generateHelperTypes(),
		]).catch((error) => this.ux.error(error));
		this.ux.stopSpinner("done");
	}

	private _cachedConnection: CachedConnectionWrapper;
	private get cachedConnection() {
		if (this._cachedConnection == null) {
			this._cachedConnection = new CachedConnectionWrapper(
				this.org.getConnection()
			);
		}
		return this._cachedConnection;
	}

	private async generateSObjectTypings() {
		return new SObjectTypingsGenerator(new FieldTypingsGeneratorFactory()).generateForProject(
			this.project,
			this.cachedConnection,
			false
		);
	}

	private async generateSObjectSchema() {
		return new SchemaGenerator().generateForProject(this.project, this.cachedConnection, false, []);
	}

	private async generateHelperTypes() {
		return new HelperTypesGenerator().generateForProject(
			this.project,
			this.cachedConnection,
			false
		);
	}

	private async generateApexTypings() {
		return new ApexTypesGenerator().generateForProject(
			this.project,
			this.cachedConnection,
			true
		);
	}

	private async generateStdblib() {
		return new StandardLibraryGenerator().generateStandardLibrary(
			this.project,
			this.cachedConnection
		);
	}

	private async generateCustomPermissionsTypings() {
		return new CustomPermissionsTypingsGenerator().generateTypingsForProject(
			this.cachedConnection,
			this.project
		);
	}

	private async generateUserPermsissionsTypings() {
		return new UserPermissionsTypingsGenerator().generateTypingsForProject(
			this.cachedConnection,
			this.project
		);
	}

	private async generateStaticResourcesTypings() {
		return new StaticResourcesTypingGenerator().generateTypingsForProject(
			this.cachedConnection,
			this.project
		);
	}

	private async generateLabelsTypings() {
		return new LabelsTypingsGenerator().generateForAll(
			this.cachedConnection,
			this.project
		);
	}

	private async generateJsConfigs() {
		return new JsConfigGenerator().generateForProject(this.project);
	}
}
