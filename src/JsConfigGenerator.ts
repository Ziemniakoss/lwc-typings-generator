import { relative, dirname, basename, join, sep } from "path";
import { promises } from "fs";
import { SfdxCommand } from "@salesforce/command";
import { findAllFilesWithExtension, getTypingsDir } from "./utils/filesUtils";
import { LWC_METADATA_FILE_EXTENSION } from "./utils/constants";

interface CompilerOptions {
	experimentalDecorators: boolean;
	baseUrl: string;
	paths: Record<string, string[]>;
	checkJs: boolean;
}
interface JsConfig {
	compilerOptions: CompilerOptions;
	include: string[];
}

export default class JsConfigGenerator {
	async generateJsConfigs(project: SfdxCommand["project"]) {
		const stdlibPath = await getTypingsDir(project);
		const lwcMetadataFilesPaths = await findAllFilesWithExtension(
			project.getPath(),
			LWC_METADATA_FILE_EXTENSION
		);
		const jsConfigGenerator = new JsConfigGenerator();
		for (const lwcMetadataFile of lwcMetadataFilesPaths) {
			await jsConfigGenerator.generateJsConfig(
				lwcMetadataFile,
				lwcMetadataFilesPaths,
				stdlibPath
			);
		}
	}

	async generateJsConfig(
		lwcPath: string,
		allLwcPaths: string[],
		dirWithStdlib: string
	) {
		const jsConfig = this.getBaseJsconfig(lwcPath, dirWithStdlib);
		for (const lwcMetadataFile of allLwcPaths) {
			if (lwcMetadataFile == lwcPath) {
				continue;
			}
			const containingDir = dirname(
				relative(dirname(lwcPath), lwcMetadataFile)
			);
			const componentName = basename(containingDir);
			const componentJsPath = join(containingDir, `${componentName}.js`);
			jsConfig.compilerOptions.paths[`c/${componentName}`] = [componentJsPath];
			jsConfig.include.push(componentJsPath);
		}
		return this.writeJsConfig(lwcPath, jsConfig);
	}

	private getBaseJsconfig(lwcPath: string, dirWithStdLib: string): JsConfig {
		return {
			compilerOptions: {
				experimentalDecorators: true,
				baseUrl: ".",
				checkJs: true,
				paths: {},
			},
			include: [
				"*.js",
				"*.d.ts",
				`${relative(dirname(lwcPath), dirWithStdLib)}${sep}**${sep}*.d.ts`,
			],
		};
	}

	private async writeJsConfig(lwcPath: string, jsConfig: JsConfig) {
		const containingDir = dirname(lwcPath);
		const path = join(containingDir, "jsconfig.json");
		return promises.writeFile(path, JSON.stringify(jsConfig, null, 4));
	}
}
