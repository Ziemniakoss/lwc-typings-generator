import { promises, lstatSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { SfdxCommand } from "@salesforce/command";

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

export function getTypingsDir(project: SfdxCommand["project"]): string {
	const typingsFolder = join(project.getPath(), ".sfdx", "lwc-typings");
	if (!existsSync(typingsFolder)) {
		mkdirSync(typingsFolder);
	}
	return typingsFolder;
}
