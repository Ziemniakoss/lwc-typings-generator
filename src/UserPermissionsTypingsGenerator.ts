import { SfdxProject } from "@salesforce/core";
import { join } from "path";
import { promises } from "fs";
import CachedConnectionWrapper from "./utils/CachedConnectionWrapper";
import { getTypingsDir } from "./utils/configUtils";

interface UserPermission {
	apiName: string;
	label: string;
}

export default class UserPermissionsTypingsGenerator {
	async generateTypingsForProject(
		connection: CachedConnectionWrapper,
		project: SfdxProject
	) {
		const [userPermissions, typingsFolder] = await Promise.all([
			this.getUserPermissions(connection),
			getTypingsDir(project),
		]);
		const fileWithTypings = join(typingsFolder, "user-permissions.d.ts");
		await promises.writeFile(fileWithTypings, "");
		for (const userPermission of userPermissions) {
			await promises.appendFile(
				fileWithTypings,
				`
/**
 * User permission ${userPermission.label}
 */
declare module "@salesforce/userPermission/${userPermission.apiName}" {
	/**
	 * Set to true if user has user permission named: ${userPermission.label}
	 */
	const ${userPermission.apiName}: boolean | null
	export default ${userPermission.apiName}
}\n\n`
			);
		}
	}

	async getUserPermissions(
		connection: CachedConnectionWrapper
	): Promise<UserPermission[]> {
		return connection.describe("Profile").then((profileDescribe) => {
			return profileDescribe.fields
				.filter((field) => field.name.startsWith("Permissions"))
				.map((field) => ({
					apiName: field.name.substring(11),
					label: field.label,
				}))
				.sort((a, b) => {
					return a.apiName > b.apiName ? 1 : -1;
				});
		});
	}
}
