import { join } from "path";
import { existsSync, rmSync, promises } from "fs";
import { getTypingsDir, mkdirs } from "./utils/filesUtils";
import { splitIntoSubArrays } from "./utils/collectionUtils";
import { SfdxCommand } from "@salesforce/command";
import CachedConnectionWrapper from "./utils/CachedConnectionWrapper";

const READ_OPERATION_LIMIT = 10;
const GENERATED_BY_STRING =
	"Generated by [lwc-typings-generator](https://www.npmjs.com/package/lwc-typings-generator)\n\n";
export default class LabelsTypingsGenerator {
	async generateForLabel(
		fullName: string,
		description: string,
		categories: string[] = [],
		typingsFolder: string
	) {
		const labelsTypingsFolder = join(typingsFolder, "labels");
		mkdirs(labelsTypingsFolder);

		let namespace = "c";
		const splitedLabel = fullName.split("__");
		if (splitedLabel.length > 1) {
			fullName = splitedLabel[1];
			namespace = splitedLabel[0];
		}
		const docsString =
			"/**\n" +
			`# ${fullName}\n\n` +
			GENERATED_BY_STRING +
			description +
			"\n" +
			"## Categories\n" +
			categories.map((c) => `- ${c}`).join("\n") +
			"\n*/\n";
		const typings =
			`declare module "@salesforce/label/${namespace}.${fullName}" {\n` +
			docsString +
			`\tconst ${fullName}:string\n` +
			`\texport default ${fullName}\n` +
			"}\n";
		const filePath = join(labelsTypingsFolder, `${namespace}.${fullName}.d.ts`);
		return promises.writeFile(filePath, typings);
	}

	async generateForAll(
		connection: CachedConnectionWrapper,
		project: SfdxCommand["project"]
	) {
		const typingsFolder = await getTypingsDir(project);
		const labelTypingsDir = join(typingsFolder, "labels");
		if (existsSync(labelTypingsDir)) {
			rmSync(labelTypingsDir, { recursive: true });
		}
		const labelFullNames = (
			await connection.metadata.list({ type: "CustomLabel" })
		).map((basicMetadata) => basicMetadata.fullName);
		const labelsFullNamesInBatches = splitIntoSubArrays(
			labelFullNames,
			READ_OPERATION_LIMIT
		);

		const promises = [];
		for (const batch of labelsFullNamesInBatches) {
			const promise = connection.metadata
				.read("CustomLabel", batch)
				.then((labelsData) => {
					const generationPromises = [];
					// @ts-ignore
					for (const data of labelsData) {
						const fullName = data.fullName;
						const description = data.shortDescription;
						const categories = data.categories?.split(",") ?? [];
						generationPromises.push(
							this.generateForLabel(
								fullName,
								description,
								categories,
								typingsFolder
							)
						);
					}
					return Promise.all(generationPromises);
				});
			promises.push(promise);
		}
		return Promise.all(promises);
	}
}
