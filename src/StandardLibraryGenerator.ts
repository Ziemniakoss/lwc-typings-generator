import { SfdxCommand } from "@salesforce/command";
import { Connection } from "jsforce";
import { getResourcesFolder, getTypingsDir, mkdirs } from "./utils/filesUtils";
import { promises } from "fs";
import { basename, join } from "path";

export default class StandardLibraryGenerator {
	async generateStandardLibrary(
		project: SfdxCommand["project"],
		connection: Connection
	) {
		const typingsDir = getTypingsDir(project);
		return Promise.all([
			this.generateBaseLightningComponentFile(typingsDir, connection),
			this.generateStdlib(typingsDir),
			this.generateStandardComponentsTypings(typingsDir),
		]);
	}

	private async generateStandardComponentsTypings(typingsDir: string) {
		return this.copyFiles(
			join(getResourcesFolder(), "lightning"),
			join(typingsDir, "lightning_components")
		);
	}

	private async generateStdlib(typingsDir: string) {
		return this.copyFiles(
			join(getResourcesFolder(), "stdlib"),
			join(typingsDir, "stdlib")
		);
	}

	private async copyFiles(from: string, to: string) {
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

	private async generateBaseLightningComponentFile(
		typingDir: string,
		connection: Connection
	) {
		const tagNameToLwcComponentImport = new Map<string, string>([
			["lightning-combobox", `import("lightning/combobox").default`],
			["lightning-input", `import("lightning/input").default`],
			["lightning-datatable", `import("lightning/datatable").default`],
			[
				"lightning-formatted-date-time",
				`import("lightning/formattedDateTime").default`,
			],
			[
				"lightning-formatted-number",
				`import("lightning/formattedNumber").default`,
			],
			["lightning-formatted-text", `import("lightning/formattedText").default`],
			["lightning-formatted-url", `import("lightning/formattedUrl").default`],
		]);
		await connection.metadata
			.list({ type: "LightningComponentBundle" })
			.then((metadata) =>
				metadata.map((m) => {
					const namespace = m.namespacePrefix ?? "c";
					const fullName = m.fullName;
					const tagName = this.kebabCase(`${namespace}-${fullName}`);
					const importPath = `import("${namespace}/${fullName}").default`;
					tagNameToLwcComponentImport.set(tagName, importPath);
				})
			);
		const baseTypings = await promises.readFile(
			join(getResourcesFolder(), "base.d.ts"),
			"utf-8"
		);
		let typings =
			"interface LwcElementTadNameMap extends HTMLElementTagNameMap {\n";
		for (const [tagName, importPath] of tagNameToLwcComponentImport.entries()) {
			typings += `\t"${tagName}": ${importPath}\n`;
		}
		typings += "}\n\n" + baseTypings;

		const outputPath = join(typingDir, "base.d.ts");
		return promises.writeFile(outputPath, typings);
	}

	private kebabCase(original: string): string {
		return original
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
	}
}
