import { existsSync, lstatSync, mkdirSync, promises } from "fs";
import { basename, dirname, join } from "path";
import { SfdxCommand } from "@salesforce/command";
import { parseStringPromise } from "xml2js";

const SKIPPED_FOLDERS = ["node_modules", ".git", ".github", ".sfdx"];

export async function findAllFilesWithExtension(
	basePath: string,
	fileExtension: string
): Promise<string[]> {
	const allFiles = await findAllFiles(basePath);
	const filesWithExtension = [];
	for (const file of allFiles) {
		if (file.endsWith(fileExtension)) {
			filesWithExtension.push(file);
		}
	}
	return filesWithExtension;
}

export async function findAllFiles(basePath: string) {
	const dirs = [];
	const files = [];
	for (const fileOrDir of await promises.readdir(basePath)) {
		if (fileOrDir.startsWith(".")) {
			continue;
		}
		const fullFileOrDirPath = join(basePath, fileOrDir);
		const fileOrDirStats = lstatSync(fullFileOrDirPath);
		if (fileOrDirStats.isFile()) {
			files.push(fullFileOrDirPath);
		} else if (
			fileOrDirStats.isDirectory() &&
			!SKIPPED_FOLDERS.includes(fileOrDir)
		) {
			dirs.push(fullFileOrDirPath);
		}
	}
	const filesInSubFolders = await Promise.all(
		dirs.map((dir) => findAllFiles(dir))
	).then((results) => results.flat());

	for (const fileInSubFolder of filesInSubFolders) {
		files.push(fileInSubFolder);
	}

	return files;
}

export function getResourcesFolder(): string {
	return join(getRootPluginFolder(), "resources");
}

export function getRootPluginFolder(): string {
	let currentDir = __dirname;
	while (!existsSync(join(currentDir, "package.json"))) {
		currentDir = dirname(currentDir);
	}
	return currentDir;
}

export function mkdirs(path: string) {
	const parentDir = dirname(path);
	if (!existsSync(parentDir)) {
		mkdirs(parentDir);
	}
	if (!existsSync(path)) {
		mkdirSync(path);
	}
}

export async function getTypingsDir(
	project: SfdxCommand["project"]
): Promise<string> {
	const pathToGeneratorConfig = join(
		project.getPath(),
		".config",
		"lwc-typings-generation-config.json"
	);
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
 * Deletes all files asynchronously
 *
 * @param files files to delete
 */
export async function deleteFiles(files: string[]) {
	const promises = files
		.filter((file) => existsSync(file))
		.map((file) => promises.rm(file, { recursive: true, force: true }));
	return Promise.all(promises);
}

export function getFileNameWithoutExtension(
	fullPath: string,
	extensionName: string
): string {
	const fileName = basename(fullPath);
	if (fileName.endsWith(extensionName)) {
		return fileName.substring(0, fileName.length - extensionName.length);
	}
	return fileName;
}
export async function findFile(
	fileName: string,
	directory: string
): Promise<string | null> {
	const dirContent = await promises
		.readdir(directory)
		.then((files) => files.map((file) => join(directory, file)));
	const conntentsWithProps = await Promise.all(
		dirContent.map((file) => ({ file, properties: promises.lstat(file) }))
	);
	const dirs = [];
	for (const p of conntentsWithProps) {
		const properties = await p.properties;
		if (properties.isDirectory()) {
			dirs.push(p.file);
		} else if (properties.isFile() && basename(p.file) == fileName) {
			return p.file;
		}
	}

	const foundFilesInSubdirs = await Promise.all(
		dirs.map((dirName) => findFile(fileName, dirName))
	);
	return foundFilesInSubdirs.find((file) => file != null);
}

export async function getXmlFromFile<T>(filePath: string): Promise<T> {
	return promises.readFile(filePath, "utf-8").then(parseStringPromise);
}
