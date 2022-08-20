import { Connection, FileProperties } from "jsforce";
import { SfdxProject } from "@salesforce/core";
import { join } from "path";
import { getTypingsDir, mkdirs } from "./utils/filesUtils";
import { wrapInArray } from "./utils/collectionUtils";
import { promises } from "fs";

export class HelperTypesGenerator {
	async generateTypingsForProject(
		connection: Connection,
		project: SfdxProject
	) {
		const helperTypingsFolder = await this.getHelperTypesFolder(project);
		return Promise.all([
			this.generateTabHelperType(connection, project, helperTypingsFolder),
		]);
	}

	private async generateTabHelperType(
		connection: Connection,
		project: SfdxProject,
		helperTypingsFolder: string
	) {
		const tasMetadata = await this.fetchTabsData(connection);
		const typingsFile = join(helperTypingsFolder, "tabs.d.ts");
		let typings = `declare namespace Salesforce {\n\tdeclare type TabApiName =\n`;
		typings += tasMetadata
			.map((tabMetadata) => `\t\t"${tabMetadata.fullName}"`)
			.join(" |\n");
		return promises.writeFile(typingsFile, typings + "\n}\n");
	}

	private async fetchTabsData(
		connection: Connection
	): Promise<FileProperties[]> {
		return connection.metadata
			.list({ type: "CustomTab" })
			.then((tabs) => wrapInArray(tabs));
	}

	private async getHelperTypesFolder(project: SfdxProject): Promise<string> {
		const typingsFolder = await getTypingsDir(project);
		const helperTypesFolder = join(typingsFolder, "helper");
		mkdirs(helperTypesFolder);
		return helperTypesFolder;
	}
}
