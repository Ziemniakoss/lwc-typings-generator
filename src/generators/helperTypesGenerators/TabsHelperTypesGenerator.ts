import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { FileProperties } from "jsforce";
import { wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";
import { SfdxProject } from "@salesforce/core";
import CachedConnectionWrapper from "../../utils/CachedConnectionWrapper";

export default class TabsHelperTypesGenerator implements IHelperTypesGenerator {
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: CachedConnectionWrapper
	): Promise<any> {
		const tasMetadata = await this.fetchTabsData(connection);
		const typingsFile = join(helperTypesRoot, "tabs.d.ts");
		let typings = `declare namespace Salesforce {\n\tdeclare type TabApiName =\n`;
		typings += tasMetadata
			.map((tabMetadata) => `\t\t"${tabMetadata.fullName}"`)
			.join(" |\n");
		return promises.writeFile(typingsFile, typings + "\n}\n");
	}
	private async fetchTabsData(
		connection: CachedConnectionWrapper
	): Promise<FileProperties[]> {
		return connection.metadata
			.list({ type: "CustomTab" })
			.then((tabs) => wrapInArray(tabs));
	}
}
