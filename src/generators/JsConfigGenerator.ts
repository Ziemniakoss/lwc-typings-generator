import { relative, dirname, basename, join, sep } from "path";
import { existsSync, promises } from "fs";
import {
	deleteFiles,
	findAllFiles,
	findAllFilesWithExtension,
	getGeneratorConfigFile,
	getTypingsDir,
} from "../utils/filesUtils";
import { LWC_METADATA_FILE_EXTENSION } from "../utils/constants";
import ITypingGenerator from "./ITypingGenerator";
import { SfdxProject } from "@salesforce/core";
import { Connection } from "jsforce";

interface AdditionalTypesConfig {
	common: string[];
	componentSpecific: Record<string, string[]>;
}

interface CompilerOptions {
	experimentalDecorators: boolean;
	baseUrl: string;
	paths: Record<string, string[]>;
	noResolve: boolean;
	target: string;
	checkJs: boolean;
}

interface JsConfig {
	compilerOptions: CompilerOptions;
	include: string[];
}

/**
 * Generates JsConfig files for project.
 *
 */
export default class JsConfigGenerator implements ITypingGenerator {
	private async generateJsConfig(
		lwcPath: string,
		allLwcPaths: string[],
		dirWithStdlib: string,
		additionalTypesConfig: AdditionalTypesConfig
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
		console.log(additionalTypesConfig);
		this.addAdditionalTypesInfo(lwcPath, jsConfig, additionalTypesConfig);
		return this.writeJsConfig(lwcPath, jsConfig);
	}

	private addAdditionalTypesInfo(
		lwcPath: string,
		jsConfig: JsConfig,
		additionalTypesConfig: AdditionalTypesConfig
	) {
		const lwcDirname = dirname(lwcPath);
		const componentKey = `c/${basename(lwcDirname)}`;
		console.log(componentKey);
		const allPathsToAdd = [
			...additionalTypesConfig.common,
			...(additionalTypesConfig.componentSpecific[componentKey] ?? []),
		];
		for (const commonTypingsDir of allPathsToAdd) {
			const path = relative(lwcDirname, commonTypingsDir);
			jsConfig.include.push(path);
		}
	}

	private getBaseJsconfig(lwcPath: string, dirWithStdLib: string): JsConfig {
		return {
			compilerOptions: {
				experimentalDecorators: true,
				baseUrl: ".",
				noResolve: true,
				checkJs: true,
				paths: {},
				target: "ES2022",
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

	async deleteForFile(project: SfdxProject, filePath: string) {
		const jsConfigFileForComponent = join(dirname(filePath), "jsconfig.json");
		if (existsSync(jsConfigFileForComponent)) {
			return promises.rm(jsConfigFileForComponent);
		}
	}

	async deleteForMetadata(project: SfdxProject, metadataFullNames: string[]) {
		// Unsupported
		return;
	}

	async deleteForProject(project: SfdxProject) {
		const jsConfigs = await findAllFiles(project.getPath()).then((files) =>
			files.filter((file) => basename(file) == "jsconfig.json")
		);
		return deleteFiles(jsConfigs);
	}

	private async getAdditionalTypesConfig(
		project: SfdxProject
	): Promise<AdditionalTypesConfig> {
		const fileWithConfig = getGeneratorConfigFile(project);
		let config = {
			common: [],
			componentSpecific: {},
		};
		if (existsSync(fileWithConfig)) {
			const configContent = await promises
				.readFile(fileWithConfig, "utf-8")
				.then((a) => JSON.parse(a));
			config = {
				...config,
				...configContent,
			};
		}
		const componentSpecific = {};
		for (const componentName in config.componentSpecific) {
			componentSpecific[componentName] = config.componentSpecific[
				componentName
			].map((pathAsArray) => join(...pathAsArray));
		}
		return {
			common: config.common.map((pathAsArray) => join(...pathAsArray)),
			componentSpecific,
		};
	}

	async generateForFile(
		project: SfdxProject,
		connection: Connection,
		filePath: string
	) {
		const stdlibPath = await getTypingsDir(project);
		const lwcMetadataFilesPaths = await findAllFilesWithExtension(
			project.getPath(),
			LWC_METADATA_FILE_EXTENSION
		);
		return this.generateJsConfig(
			filePath,
			lwcMetadataFilesPaths,
			stdlibPath,
			await this.getAdditionalTypesConfig(project)
		);
	}

	async generateForMetadata(
		project: SfdxProject,
		connection: Connection,
		metadataFullNames: string[]
	) {
		// Unsupported
		return;
	}

	async generateForProject(
		project: SfdxProject,
		connection: Connection = null,
		deleteExisting: boolean = false
	) {
		const stdlibPath = await getTypingsDir(project);
		const lwcMetadataFilesPaths = await findAllFilesWithExtension(
			project.getPath(),
			LWC_METADATA_FILE_EXTENSION
		);
		const additionalTypesConfig = await this.getAdditionalTypesConfig(project);
		const promises = lwcMetadataFilesPaths.map((lwcMetadataFile) =>
			this.generateJsConfig(
				lwcMetadataFile,
				lwcMetadataFilesPaths,
				stdlibPath,
				additionalTypesConfig
			)
		);
		return Promise.all(promises);
	}
}
