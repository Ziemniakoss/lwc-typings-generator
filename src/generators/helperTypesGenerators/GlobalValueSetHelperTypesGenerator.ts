import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { SfdxProject } from "@salesforce/core";
import {
	METADATA_READ_COUNT_LIMIT,
	METADATA_TYPES,
} from "../../utils/constants";
import { splitIntoSubArrays, wrapInArray } from "../../utils/collectionUtils";
import { join } from "path";
import { promises } from "fs";
import CachedConnectionWrapper from "../../utils/CachedConnectionWrapper";

export default class GlobalValueSetHelperTypesGenerator
	implements IHelperTypesGenerator
{
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: CachedConnectionWrapper
	) {
		const globalVaueSetsApiNames = await connection.metadata
			.list({ type: METADATA_TYPES.GLOBAL_VALUE_SET })
			.then(wrapInArray)
			.then((metadata) => metadata.map((m) => m.fullName));
		const batches = splitIntoSubArrays(
			globalVaueSetsApiNames,
			METADATA_READ_COUNT_LIMIT
		);

		const filePath = join(helperTypesRoot, "globalValueSets.d.ts");
		const typingsHeader =
			"declare namespace Salesforce {\n\tdeclare namespace GlobalValueSets {\n";
		const typingsFooter = "\n\t}\n}\n";
		if (globalVaueSetsApiNames.length == 0) {
			return promises.writeFile(filePath, typingsHeader + typingsFooter);
		}
		await promises.writeFile(filePath, typingsHeader);
		const readingPromises = batches.map((batch) => {
			return connection.metadata
				.read(METADATA_TYPES.GLOBAL_VALUE_SET, batch)
				.then(wrapInArray);
		});
		for await (const gvsBatch of readingPromises) {
			const typings = gvsBatch
				.map(this.generateTypingsForGlobalValueSet)
				.join("\n");
			await promises.appendFile(filePath, typings);
		}
		return promises.appendFile(filePath, typingsFooter);
	}

	private generateTypingsForGlobalValueSet(gvsMetadata): string {
		let jsDocs = `\t\t/**\n\t\t * # ${gvsMetadata.masterLabel}\n`;
		if (gvsMetadata.description) {
			jsDocs += "\t\t * " + gvsMetadata.description + "\n";
		}
		jsDocs += "\t\t*/\n";
		const typeDefinition = `\t\ttype ${gvsMetadata.fullName} =\n`;
		const valuesTypings = wrapInArray(gvsMetadata.customValue)
			.map((value) => `\t\t\t"${value.fullName}"`)
			.join(" |\n");
		return jsDocs + typeDefinition + valuesTypings;
	}
}
