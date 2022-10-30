import ITypingGenerator from "./ITypingGenerator";
import {Connection} from "jsforce";
import {SfdxProject} from "@salesforce/core";
import {findAllFilesWithExtension, getTypingsDir} from "../utils/filesUtils";
import {FILE_EXTENSIONS, METADATA_TYPES} from "../utils/constants";
import {groupBy, wrapInArray} from "../utils/collectionUtils";
import {basename, join} from "path";
import {existsSync, promises} from "fs";

/**
 * Generates typings for Apex classes using Antlr grammar
 */
export default class ApexTypesGenerator implements ITypingGenerator {
	async deleteForFile(project: SfdxProject, filePath: string): Promise<any> {
		return Promise.resolve(undefined);
	}

	async deleteForMetadata(
		project: SfdxProject,
		metadataFullNames: string[]
	): Promise<any> {
		throw Error("Not supported yet");
	}

	async deleteForProject(project: SfdxProject): Promise<any> {
		const typingsFolder = join(await getTypingsDir(project), "apex");
		if (existsSync(typingsFolder)) {
			return promises.rm(typingsFolder, {
				force: true,
				recursive: true,
			});
		}
	}

	async generateForFile(
		project: SfdxProject,
		connection: Connection,
		filePath: string
	): Promise<any> {
		throw Error("Not supported yet");
	}

	async generateForMetadata(
		project: SfdxProject,
		connection: Connection,
		metadataFullNames: string[]
	): Promise<any> {
		throw Error("Not supported yet");
	}

	async generateForProject(
		project: SfdxProject,
		connection: Connection,
		deleteExisting: boolean
	): Promise<any> {
		const [
			apexFilesMap,
			allApexClassesNames
		] = await Promise.all([
			findAllFilesWithExtension(project.getPath(), FILE_EXTENSIONS.APEX_CLASS).then(apexFile => groupBy(apexFile, (file) => basename(file).replace(".cls", ""))),
			connection.metadata.list({type: METADATA_TYPES.APEX_CLASS}).then(wrapInArray)
		])
		return findAllFilesWithExtension(
			project.getPath(),
			FILE_EXTENSIONS.APEX_CLASS
		).then((files) => {
			const generationPromises = wrapInArray(files).map((file) =>
				this.generateForFile(project, connection, file)
			);
			return Promise.all(generationPromises);
		});
	}
}
