import { SfdxCommand } from "@salesforce/command";
import { basename, dirname, join } from "path";
import { existsSync, promises } from "fs";

export default class GenerateStdLib extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	async run() {
		await this.createBaseComponentTypings();
	}

	async createBaseComponentTypings() {
		const sourceDir = join(
			this.getRootPluginFolder(),
			"resources",
			"lightning"
		);
		const componentFiles = (await promises.readdir(sourceDir)).map((file) =>
			join(sourceDir, file)
		);
		const outputFolder = join(await this.getTypingsDir(), "components");
		if (!existsSync(outputFolder)) {
			await promises.mkdir(outputFolder);
		}
		return Promise.all(
			componentFiles.map((file) => {
				const outputFile = join(outputFolder, basename(file));
				return promises.copyFile(file, outputFile);
			})
		);
	}

	async createStdlib() {
		//TODO
	}

	async createBaseFile() {
		//TODO
	}

	async getTypingsDir(): Promise<string> {
		const typingsFolder = join(this.project.getPath(), ".sfdx", "lwc-typings");
		if (!existsSync(typingsFolder)) {
			await promises.mkdir(typingsFolder);
		}
		return typingsFolder;
	}

	getRootPluginFolder(): string {
		let currentDir = __dirname;
		while (!existsSync(join(currentDir, "package.json"))) {
			currentDir = dirname(currentDir);
		}
		return currentDir;
	}
}
