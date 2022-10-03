import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { Connection } from "jsforce";
import { METADATA_TYPES } from "../../utils/constants";
import { wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";

export default class ApplicationsHelperTypesGenerator
	implements IHelperTypesGenerator
{
	async generateForProject(
		helperTypesRoot: string,
		connection: Connection
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
