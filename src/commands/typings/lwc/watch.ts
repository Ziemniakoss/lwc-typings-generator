import { SfdxCommand } from "@salesforce/command";
import { watch } from "chokidar";
import { Messages } from "@salesforce/core";
import { HelperTypesGenerator } from "../../../generators/HelperTypesGenerator";
import { ApexTypingsGenerator } from "../../../apexTypingsGeneration/ApexTypingsGenerator";
import WiredMethodTypingsGenerator from "../../../apexTypingsGeneration/wiredMethodsTypingsGeneration/WiredMethodTypingsGenerator";
import ApexClassTypingsGenerator from "../../../apexTypingsGeneration/apexClassesTypingsGeneration/ApexClassTypingsGenerator";
import StandardLibraryGenerator from "../../../StandardLibraryGenerator";
import CustomPermissionsTypingsGenerator from "../../../CustomPermissionsTypingsGenerator";
import UserPermissionsTypingsGenerator from "../../../UserPermissionsTypingsGenerator";
import StaticResourcesTypingGenerator from "../../../StaticResourcesTypingGenerator";
import LabelsTypingsGenerator from "../../../LabelsTypingsGenerator";
import JsConfigGenerator from "../../../generators/JsConfigGenerator";
import { PLUGIN_NAME } from "../../../utils/constants";

const IGNORED_PATHS = ["**/node_modules", "**/.*", "**/jsconfig.json"];

const MS_DEBOUNCING = 100;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(PLUGIN_NAME, "watch");

export default class DynamicTypingsGenerator extends SfdxCommand {
	public static requiresProject = true;
	public static requiresUsername = true;
	public static description = messages.getMessage("description");

	private apexTypingsGenerator = new ApexTypingsGenerator(
		new WiredMethodTypingsGenerator(),
		new ApexClassTypingsGenerator()
	);

	async run() {
		await this.generateAll();

		this.ux.stopSpinner(messages.getMessage("watcherInitialization"));
		const watcher = watch(this.project.getPath(), {
			ignored: IGNORED_PATHS,
			ignoreInitial: true,
		});
		watcher.on("add", (path) => this.handleChangeInPath(path));
		watcher.on("change", (path) => this.handleChangeInPath(path));
		watcher.on("unlink", (path) => this.handleChangeInPath(path));
		this.ux.stopSpinner();

		this.ux.log(messages.getMessage("watching"));
	}

	handleChangeInPath(path: string) {
		this.debounceRegeneration(path);
	}

	debounceId;

	changedPaths: Set<string> = new Set();

	debounceRegeneration(path) {
		if (this.debounceId != null) {
			clearTimeout(this.debounceId);
		}
		this.changedPaths.add(path);
		this.debounceId = setTimeout(() => this.regenerateTypings(), MS_DEBOUNCING);
	}

	async regenerateTypings() {
		const pathsToRegenerate = this.changedPaths;
		this.changedPaths = new Set();
		let regenerateLwc = false;
		let regenerateApex = false;
		let regenerateLabels = false;
		pathsToRegenerate.forEach((path) => {
			if (path.endsWith(".cls")) {
				regenerateApex = true;
			} else if (path.endsWith(".labels-meta.xml")) {
				regenerateLabels = true;
			} else if (path.endsWith(".js")) {
				regenerateLwc = true;
			}
		});

		const promises = [];
		if (regenerateLwc) {
			promises.push(this.generateStdblib());
			promises.push(this.generateJsConfigs());
		}
		if (regenerateApex) {
			promises.push(this.generateApexTypings());
		}
		if (regenerateLabels) {
			promises.push(this.generateLabelsTypings());
		}
		if (promises.length != 0) {
			this.ux.startSpinner(messages.getMessage("regenerating"));
			await Promise.all(promises);
			this.ux.stopSpinner();
			this.ux.log(messages.getMessage("watching"));
		}
	}

	private async generateAll() {
		this.ux.startSpinner(messages.getMessage("initialGeneration"));
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
		this.ux.stopSpinner();
	}

	private async generateHelperTypes() {
		return new HelperTypesGenerator().generateForProject(
			this.project,
			this.org.getConnection(),
			false
		);
	}

	private async generateApexTypings() {
		return this.apexTypingsGenerator.generateTypingsForProject(
			this.org.getConnection(),
			this.project
		);
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
