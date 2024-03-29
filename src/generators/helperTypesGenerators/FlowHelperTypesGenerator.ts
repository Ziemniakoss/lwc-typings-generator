import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { SfdxProject } from "@salesforce/core";
import { FileProperties } from "jsforce";
import { wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";
import { METADATA_TYPES } from "../../utils/constants";
import CachedConnectionWrapper from "../../utils/CachedConnectionWrapper";

export default class FlowHelperTypesGenerator implements IHelperTypesGenerator {
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: CachedConnectionWrapper
	): Promise<any> {
		const flowsMetadata: FileProperties[] = await connection.metadata
			.list({ type: METADATA_TYPES.FLOW })
			.then(wrapInArray);
		const typingsHeader = `declare namespace Salesforce {\n\tdeclare type FlowApiName =`;
		let apiNames: string;
		if (flowsMetadata.length == 0) {
			apiNames = "any";
		} else {
			apiNames =
				"\n" +
				flowsMetadata.map((flow) => `\t\t"${flow.fullName}"`).join(" |\n");
		}
		const typings = typingsHeader + apiNames + "\n}\n";
		const outputPath = join(helperTypesRoot, "flows.d.ts");
		return promises.writeFile(outputPath, typings);
	}
}
