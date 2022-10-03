import { SfdxProject } from "@salesforce/core";
import { Connection, FileProperties } from "jsforce";
import { wrapInArray } from "./collectionUtils";
import { findFile } from "./filesUtils";
import { existsSync } from "fs";

interface MetadataStorageSummary {
	filesForMetadata: string[];
	fullNamesWithoutLocalFiles: string[];
}

/**
 * Prepare summary of which metadata is stored locally and which one is stored in org
 *
 * @param project
 * @param connection
 * @param metadataType type of metadata to fetch
 * @param getFileName function that converts fullName of metadata to file name in which it should be stored
 */
export async function getMetadataStorageSummary(
	project: SfdxProject,
	connection: Connection,
	metadataType: string,
	getFileName: (fullName: string) => string
): Promise<MetadataStorageSummary> {
	const metadata: FileProperties[] = await connection.metadata
		.list({ type: metadataType })
		.then(wrapInArray);
	const filesForMetadata: string[] = [];
	const fullNamesWithoutLocalFiles: string[] = [];
	const promises = metadata.map((m) =>
		tryToFindLocalFile(
			project,
			m.fullName,
			getFileName,
			filesForMetadata,
			fullNamesWithoutLocalFiles
		)
	);
	await Promise.all(promises);
	return {
		filesForMetadata,
		fullNamesWithoutLocalFiles,
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
	filesForMetadata: string[],
	fullNamesWithoutLocalFiles: string[]
) {
	const fileNameForMetadata = getFileName(metadataFullName);
	const fullFilePath = await findFile(fileNameForMetadata, project.getPath());
	if (existsSync(fullFilePath)) {
		filesForMetadata.push(fullFilePath);
	} else {
		fullNamesWithoutLocalFiles.push(metadataFullName);
	}
}
