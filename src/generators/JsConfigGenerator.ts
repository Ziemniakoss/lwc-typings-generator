import { relative, dirname, basename, join, sep } from "path";
import { existsSync, promises } from "fs";
import {
	deleteFiles,
	findAllFiles,
	findAllFilesWithExtension,
	getTypingsDir,
} from "../utils/filesUtils";
import { LWC_METADATA_FILE_EXTENSION } from "../utils/constants";
import ITypingGenerator from "./ITypingGenerator";
import { SfdxProject } from "@salesforce/core";
import { Connection } from "jsforce";

interface CompilerOptions {
	experimentalDecorators: boolean;
	baseUrl: string;
	paths: Record<string, string[]>;
	lib: string[];
	checkJs: boolean;
}

interface JsConfig {
	compilerOptions: CompilerOptions;
	include: string[];
}

/**
 * Included libs in compiler options section
 */
const LIBS = ["ES2022", "DOM"];

export default class JsConfigGenerator implements ITypingGenerator {
	private async generateJsConfig(
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
				lib: LIBS,
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
		return this.generateJsConfig(filePath, lwcMetadataFilesPaths, stdlibPath);
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
		const promises = lwcMetadataFilesPaths.map((lwcMetadataFile) =>
			this.generateJsConfig(lwcMetadataFile, lwcMetadataFilesPaths, stdlibPath)
		);
		return Promise.all(promises);
	}
}
