import { Connection } from "jsforce";
import { SfdxProject } from "@salesforce/core";
import { getTypingsDir } from "./utils/filesUtils";
import { join } from "path";
import { promises } from "fs";

export default class StaticResourcesTypingGenerator {
	async generateTypingsForProject(
		connection: Connection,
		project: SfdxProject
	) {
		const [staticResources, typingsFolder] = await Promise.all([
			connection.metadata.list({ type: "StaticResource" }),
			getTypingsDir(project),
		]);
		const typingsFile = join(typingsFolder, "static-resources.d.ts");
		await promises.writeFile(typingsFile, "");

		for (const staticResource of staticResources) {
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
}
