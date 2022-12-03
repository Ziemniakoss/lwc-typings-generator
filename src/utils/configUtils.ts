import {SfdxProject} from "@salesforce/core";
import {join} from "path";
import {promises} from "fs";
import {mkdirs} from "./filesUtils";

export async function getTypingsDir(project: SfdxProject): Promise<string> {
	const pathToGeneratorConfig = getGeneratorConfigFile(project);
	const typingsFolder = await promises
		.readFile(pathToGeneratorConfig, "utf-8")
		.then((content) => JSON.parse(content))
		.then((parsedConfig) => {
			const typingsPath = parsedConfig.typingsPath;
			return Array.isArray(typingsPath)
				? join(project.getPath(), ...typingsPath)
				: join(project.getPath(), typingsPath);
		})
		.catch(() => {
			return join(project.getPath(), ".sfdx", "lwc-typings");
		});
	mkdirs(typingsFolder);
	return typingsFolder;
}

/**
 * Returns path to file with plugin configuration
 * @param project
 */
export function getGeneratorConfigFile(project: SfdxProject): string {
	return join(
		project.getPath(),
		".config",
		"lwc-typings-generation-config.json"
	);
}

let configReadingPromise: Promise<GeneratorConfig>;

/**
 * Lwc-typings-generator config strucutre
 */
interface GeneratorConfig {
	/**
	 * Folders with common typings used by all components
	 */
	common?: string[][];
	/**
	 * Path to folder in which typings should be generated.
	 */
	typingsPath?: string[];
	/**
	 * Map of component specific typings.
	 * Keys in this map are component names including namespace (like c/yourComponentName).
	 */
	componentSpecific?: Record<string, string[][]>;
	/**
	 * Api names of SObject api names used on frontend
	 */
	usedSObjectNames?: Record<string, UsedSObjectConfig>[];
	defaultDepth: 1 | 2 | 3 | 4 | 5
}

interface UsedSObjectConfig {
	/**
	 * Depth override for given sObject
	 */
	depth: number
}

/**
 * Load config for given project.
 *
 * @return config content or empty config if error occurred or config file did not exist
 */
export async function getConfig(
	project: SfdxProject
): Promise<GeneratorConfig> {
	if (configReadingPromise != null) {
		return configReadingPromise;
	}
	const configFile = getGeneratorConfigFile(project);

	configReadingPromise = promises
		.readFile(configFile, "utf-8")
		.then((fileContent) => JSON.parse(fileContent))
		.catch((error) => ({}));
	return configReadingPromise;
}
