import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { Connection } from "jsforce";
import { getMetadataStorageSummary } from "../../utils/jsForceUtils";
import { SfdxProject } from "@salesforce/core";
import { FILE_EXTENSIONS, METADATA_TYPES } from "../../utils/constants";
import { join } from "path";
import { mkdirs } from "../../utils/filesUtils";
import { existsSync, promises } from "fs";

/**
 * Generate typings for message channels payloads
 */
export default class MessageChannelsPayloadsHelperTypesGenerator
	implements IHelperTypesGenerator
{
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: Connection
	): Promise<any> {
		const { filesForMetadata, fullNamesWithoutLocalFiles, overrides } =
			await getMetadataStorageSummary<MessageChannel>(
				project,
				connection,
				METADATA_TYPES.MESSAGE_CHANNEL,
				(fullName) =>
					`${fullName}${FILE_EXTENSIONS.MESSAGE_CHANNEL_METADATA_FILE}`
			);
		const typingsDir = this.getTypingsFolder(helperTypesRoot);
		if (existsSync(typingsDir)) {
			await promises.rm(typingsDir, { force: true, recursive: true });
		}
		await mkdirs(typingsDir);
		const generationPromises = [];
		const fullNamesWithOverrides = Object.keys(overrides);
		const fullNamesToGenerateWithConnection = fullNamesWithoutLocalFiles.filter(
			(fullName) => !fullNamesWithOverrides.includes(fullName)
		);
		if (fullNamesToGenerateWithConnection.length > 0) {
			generationPromises.push(
				this.generateWithConnection(
					typingsDir,
					connection,
					fullNamesToGenerateWithConnection
				)
			);
		}
		for (const fullNameWithLocalFile of Object.keys(filesForMetadata)) {
			if (overrides[fullNameWithLocalFile] == null) {
				generationPromises.push(
					this.generateFromLocalFile(
						typingsDir,
						fullNameWithLocalFile,
						filesForMetadata[fullNameWithLocalFile]
					)
				);
			} else {
				generationPromises.push(
					this.generateFromOverride(
						typingsDir,
						overrides[fullNameWithLocalFile]
					)
				);
			}
		}
		return generationPromises;
	}

	private async generateTypings(
		typingsDir: string,
		messageChannel: MessageChannel
	) {}

	private async generateWithConnection(
		typingsDir: string,
		connection: Connection,
		fullNames: string[]
	) {}

	private async generateFromOverride(
		typingDir: string,
		override: MessageChannel
	) {
		return this.generateTypings(typingDir, override);
	}

	private async generateFromLocalFile(
		typingDir: string,
		fullName: string,
		filePath: string
	) {}

	private getTypingsFolder(helperTypesRoot: string): string {
		return join(helperTypesRoot, "message_channels");
	}
}

interface MessageChannel {
	fields: MessageChannelField[];
	fullName: string;
}

interface MessageChannelField {
	name: string;
	type: string;
	description: string;
}
