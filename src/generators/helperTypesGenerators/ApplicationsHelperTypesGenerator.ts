import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { METADATA_TYPES } from "../../utils/constants";
import { wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";
import { SfdxProject } from "@salesforce/core";
import CachedConnectionWrapper from "../../utils/CachedConnectionWrapper";

export default class ApplicationsHelperTypesGenerator
	implements IHelperTypesGenerator
{
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: CachedConnectionWrapper
	): Promise<any> {
		const typingsHeader =
			"declare namespace Salesforce {\n\tdeclare type ApplicationApiName = \n";
		const applicationTypes: string = await connection.metadata
			.list({ type: METADATA_TYPES.APPLICATION })
			.then(wrapInArray)
			.then((applications) =>
				applications.map((application) => `\t\t"${application.fullName}"`)
			)
			.then((typingsArray) => typingsArray.join("| \n"));
		const fileName = join(helperTypesRoot, "applications.d.ts");
		return promises.writeFile(
			fileName,
			typingsHeader + applicationTypes + "\n}\n"
		);
	}
}
