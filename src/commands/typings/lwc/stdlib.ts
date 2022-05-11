import { SfdxCommand } from "@salesforce/command";
import { basename, join } from "path";
import { existsSync, promises } from "fs";
import { getResourcesFolder, mkdirs } from "../../../utils/filesUtils";

export default class GenerateStdLib extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		return Promise.all([
			this.createBaseComponentTypings(),
			this.createStdlib(),
			this.createBaseFile(),
		]);
	}

	async createBaseComponentTypings() {
		return this.copyFiles(
			join(getResourcesFolder(), "lightning"),
			join(await this.getTypingsDir(), "lightning_components")
		);
	}

	async copyFiles(from: string, to: string) {
		const componentFiles = (await promises.readdir(from)).map((file) =>
			join(from, file)
		);
		mkdirs(to);
		return Promise.all(
			componentFiles.map((file) => {
				const outputFile = join(to, basename(file));
				return promises.copyFile(file, outputFile);
			})
		);
	}

	async createStdlib() {
		return this.copyFiles(
			join(getResourcesFolder(), "stdlib"),
			join(await this.getTypingsDir(), "stdlib")
		);
	}

	async createBaseFile() {
		const lwcComponents = await this.org
			.getConnection()
			.metadata.list({ type: "LightningComponentBundle" })
			.then((metadata) =>
				metadata.map((m) => {
					return {
						fullName: m.fullName,
						namespace: m.namespacePrefix ?? "c",
					};
				})
			);
		let customImportsSection = "";
		let customQuerySelectorSection = "";
		let customQuerySelectorAllSection = "";
		for (const lwc of lwcComponents) {
			const typeName = `${lwc.namespace}__${lwc.fullName}`;
			const query =
				lwc.namespace +
				"-" +
				lwc.fullName
					.split("")
					.map((char) => {
						const charInLowerCase = char.toLowerCase();
						if (charInLowerCase == char) {
							return char;
						} else {
							return `-${charInLowerCase}`;
						}
					})
					.join("");
			const importPath = `${lwc.namespace}/${lwc.fullName}`;
			customImportsSection += `type ${typeName} = import("${importPath}").default\n;`;
			customQuerySelectorSection += `querySelector(query: "${query}"): ${typeName} | null;\n`;
			customQuerySelectorAllSection += `querySelectorAll(query: "${query}"): ${typeName}[];\n`;
		}
		const baseTypings = await promises.readFile(
			join(getResourcesFolder(), "base.d.ts"),
			"utf-8"
		);
		const typings = baseTypings
			.replace("// customImportsHere", customImportsSection)
			.replace("// customQuerySelectorsHere", customQuerySelectorSection)
			.replace("// customQuerySelectorAllHere", customQuerySelectorAllSection);

		const outputPath = join(await this.getTypingsDir(), "base.d.ts");
		return promises.writeFile(outputPath, typings);
	}

	async getTypingsDir(): Promise<string> {
		const typingsFolder = join(this.project.getPath(), ".sfdx", "lwc-typings");
		if (!existsSync(typingsFolder)) {
			await promises.mkdir(typingsFolder);
		}
		return typingsFolder;
	}
}
