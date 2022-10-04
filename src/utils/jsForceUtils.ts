import { SfdxProject } from "@salesforce/core";
import { Connection, FileProperties } from "jsforce";
import { wrapInArray } from "./collectionUtils";
import { findFile } from "./filesUtils";
import { existsSync, promises } from "fs";
import { join } from "path";

interface MetadataStorageSummary<T> {
	filesForMetadata: Record<string, string>;
	fullNamesWithoutLocalFiles: string[];
	overrides: Record<string, T>;
}

/**
 * Prepare summary of which metadata is stored locally and which one is stored in org
 *
 * @param project
 * @param connection
 * @param metadataType type of metadata to fetch
 * @param getFileName function that converts fullName of metadata to file name in which it should be stored
 */
export async function getMetadataStorageSummary<T>(
	project: SfdxProject,
	connection: Connection,
	metadataType: string,
	getFileName: (fullName: string) => string
): Promise<MetadataStorageSummary<T>> {
	const overridesPath = join(
		project.getPath(),
		".config",
		"overrides",
		`${metadataType}.json`
	);
	const overridingReadingPromise: Promise<Record<string, T>> = promises
		.readFile(overridesPath, "utf-8")
		.then((content) => JSON.parse(content))
		.catch((error) => ({}));
	const metadata: FileProperties[] = await connection.metadata
		.list({ type: metadataType })
		.then(wrapInArray);
	const filesForMetadata: Record<string, string> = {};
	const fullNamesWithoutLocalFiles: string[] = [];
	const searchingPromises = metadata.map((m) =>
		tryToFindLocalFile(
			project,
			m.fullName,
			getFileName,
			filesForMetadata,
			fullNamesWithoutLocalFiles
		)
	);
	await Promise.all(searchingPromises);
	return {
		filesForMetadata,
		fullNamesWithoutLocalFiles,
		overrides: await overridingReadingPromise, //TODO add option to override
	};
}

/**
 * Tries to find local file for metadata.
 *
 * @param project
 * @param metadataFullName
 * @param getFileName
 * @param filesForMetadata array to which local file for metadata should be inserted
 * @param fullNamesWithoutLocalFiles array to which fullNames of metadata that didn't have local files
 */
async function tryToFindLocalFile(
	project: SfdxProject,
	metadataFullName: string,
	getFileName: (fullName: string) => string,
	filesForMetadata: Record<string, string>,
	fullNamesWithoutLocalFiles: string[]
) {
	const fileNameForMetadata = getFileName(metadataFullName);
	const fullFilePath = await findFile(fileNameForMetadata, project.getPath());
	if (existsSync(fullFilePath)) {
		filesForMetadata[metadataFullName] = fullFilePath;
	} else {
		fullNamesWithoutLocalFiles.push(metadataFullName);
	}
}
