import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { Connection, FileProperties } from "jsforce";
import { wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";

export default class TabsHelperTypesGenerator implements IHelperTypesGenerator {
	async generateForProject(
		helperTypesRoot: string,
		connection: Connection
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
		connection: Connection
	): Promise<FileProperties[]> {
		return connection.metadata
			.list({ type: "CustomTab" })
			.then((tabs) => wrapInArray(tabs));
	}
}
