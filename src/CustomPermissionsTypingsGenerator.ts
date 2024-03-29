import { SfdxProject } from "@salesforce/core";
import { join } from "path";
import { promises } from "fs";
import { wrapInArray } from "./utils/collectionUtils";
import CachedConnectionWrapper from "./utils/CachedConnectionWrapper";
import { getTypingsDir } from "./utils/configUtils";

export default class CustomPermissionsTypingsGenerator {
	async generateTypingsForProject(
		connection: CachedConnectionWrapper,
		project: SfdxProject
	) {
		const [customPermissions, typingsFolder] = await Promise.all([
			connection.metadata.list({ type: "CustomPermission" }),
			getTypingsDir(project),
		]);
		const fileWithTypings = join(typingsFolder, "customPermissions.d.ts");
		await promises.writeFile(fileWithTypings, "");
		for (const customPermission of wrapInArray(customPermissions)) {
			const fullName = customPermission.fullName;
			const label = customPermission.label;
			await promises.appendFile(
				fileWithTypings,
				`
/**
 * Custom permission ${label}
 */
declare module "@salesforce/customPermission/${fullName}" {
	/**
	 * Does current user have ${label} custom permission?
	 * Undefined when not granted, true otherwise
	 */
	const ${fullName}: boolean | undefined
	export default ${fullName}
}`
			);
		}
	}
}
