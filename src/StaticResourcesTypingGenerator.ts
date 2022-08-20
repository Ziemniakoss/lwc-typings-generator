import {Connection, FileProperties} from "jsforce";
import { SfdxProject } from "@salesforce/core";
import { getTypingsDir } from "./utils/filesUtils";
import { join } from "path";
import { promises } from "fs";
import {wrapInArray} from "./utils/collectionUtils";

export default class StaticResourcesTypingGenerator {
	async generateTypingsForProject(
		connection: Connection,
		project: SfdxProject
	) {
		const [staticResources, typingsFolder] = await Promise.all([
			this.fetchStaticResources(connection),
			getTypingsDir(project),
		]);
		const typingsFile = join(typingsFolder, "static-resources.d.ts");
		await promises.writeFile(typingsFile, "");

		for (const staticResource of staticResources) {
			console.log(staticResource.fullName)
			const fullName = staticResource.fullName;
			await promises.appendFile(
				typingsFile,
				`
			declare module "@salesforce/resourceUrl/${fullName}" {
				const ${fullName}: string
				export default ${fullName}
			}\n\n`
			);
		}
	}

	private async fetchStaticResources(connection:Connection):Promise<FileProperties[]> {
		return connection
			.metadata
			.list({ type: "StaticResource" })
			.then(staticResources => wrapInArray(staticResources))
	}
}
