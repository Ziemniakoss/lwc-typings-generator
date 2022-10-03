import ITypingGenerator from "./ITypingGenerator";
import { SfdxProject } from "@salesforce/core";
import { Connection, FileProperties } from "jsforce";
import {
	deleteFiles,
	findFile,
	getFileNameWithoutExtension,
	getTypingsDir,
	getXmlFromFile,
	mkdirs,
} from "../utils/filesUtils";
import { join } from "path";
import { existsSync, promises } from "fs";
import {
	FILE_EXTENSIONS,
	METADATA_READ_COUNT_LIMIT,
	METADATA_TYPES,
} from "../utils/constants";
import { splitIntoSubArrays, wrapInArray } from "../utils/collectionUtils";

export default class MessageChannelsTypingsGenerator
	implements ITypingGenerator
{
	async generateForFile(
		project: SfdxProject,
		connection: Connection,
		filePath: string,
		typingsDir?: string
	): Promise<any> {
		if (typingsDir == null) {
			typingsDir = await this.getFolder(project);
		}
		const channelXml = await getXmlFromFile<any>(filePath);
		const channelInfo: MessageChannel = {
			fullName: getFileNameWithoutExtension(
				filePath,
				FILE_EXTENSIONS.MESSAGE_CHANNEL_METADATA_FILE
			),
			description: channelXml?.LightningMessageChannel.description?.[0] ?? "",
			label: channelXml?.LightningMessageChannel?.masterLabel?.[0] ?? "",
		};
		return this.generateTypings(typingsDir, channelInfo);
	}

	async generateForMetadata(
		project: SfdxProject,
		connection: Connection,
		metadataFullNames: string[],
		typingsDir?: string
	): Promise<any> {
		if (metadataFullNames.length == 0) {
			return;
		}
		if (typingsDir == null) {
			typingsDir = await this.getFolder(project);
		}
		const batches = splitIntoSubArrays(
			metadataFullNames,
			METADATA_READ_COUNT_LIMIT
		);
		const promises = batches.map((batch) =>
			this.generateForMetadataBatch(connection, batch, typingsDir)
		);
		return Promise.all(promises);
	}

	private async generateForMetadataBatch(
		connection: Connection,
		metadataFullNames: string[],
		typingsDir: string
	): Promise<any> {
		const channelProperties: FileProperties[] = await connection.metadata
			.read(METADATA_TYPES.MESSAGE_CHANNEL, metadataFullNames)
			.then(wrapInArray);
		const promises = channelProperties
			.map((channel) => {
				const mappedChannel: MessageChannel = {
					fullName: channel.fullName,
					//@ts-ignore
					description: channel.description,
					//@ts-ignore
					label: channel.masterLabel,
				};
				return mappedChannel;
			})
			.map((channel) => this.generateTypings(typingsDir, channel));
		return Promise.all(promises);
	}

	private async generateTypings(
		typingsDir: string,
		channelInfo: MessageChannel
	) {
		const channelTypings = await this.generateChannelImport(channelInfo);
		const fileWithTypings = this.getFileNameForChannel(
			typingsDir,
			channelInfo.fullName
		);
		return promises.writeFile(fileWithTypings, channelTypings);
	}

	private async generateChannelImport(
		channelInfo: MessageChannel
	): Promise<string> {
		const channelFullName = channelInfo.fullName;
		return `
/**
 * # ${channelInfo.label}
 *
 * ${channelInfo.description}
 */
declare module "@salesforce/messageChannel/${channelFullName}" {
	const ${channelFullName}: lightning.MessageChannel<"${channelFullName}">
	export default ${channelFullName}
}`;
	}

	async generateForProject(
		project: SfdxProject,
		connection: Connection
	): Promise<any> {
		const typingsDir = await this.getFolder(project);
		const channelsMetadata: FileProperties[] = await connection.metadata
			.list({ type: METADATA_TYPES.MESSAGE_CHANNEL })
			.then(wrapInArray);
		const filesWithMetadataDefinitions = [];
		const metadataWithoutLocalFiles = [];
		for (const channelMetadata of channelsMetadata) {
			const fullName = channelMetadata.fullName;
			const fileName = `${fullName}${FILE_EXTENSIONS.MESSAGE_CHANNEL_METADATA_FILE}`;
			const fileWithMetadata = await findFile(fileName, project.getPath());
			if (existsSync(fileWithMetadata)) {
				filesWithMetadataDefinitions.push(fileWithMetadata);
			} else {
				metadataWithoutLocalFiles.push(fullName);
			}
		}
		const promises = [];
		if (filesWithMetadataDefinitions.length > 0) {
			promises.push(
				...filesWithMetadataDefinitions.map((file) =>
					this.generateForFile(project, connection, file, typingsDir)
				)
			);
		}
		if (metadataWithoutLocalFiles.length > 0) {
			promises.push(
				this.generateForMetadata(
					project,
					connection,
					metadataWithoutLocalFiles,
					typingsDir
				)
			);
		}
		return Promise.all(promises);
	}

	async deleteForFile(project: SfdxProject, filePath: string): Promise<any> {
		const typingsDir = await this.getFolder(project);
		if (!existsSync(typingsDir)) {
			return;
		}
		const file = this.getFileNameForChannel(typingsDir, filePath);
		return deleteFiles([file]);
	}

	async deleteForMetadata(
		project: SfdxProject,
		metadataFullNames: string[]
	): Promise<any> {
		const typingsDir = await this.getFolder(project);
		if (!existsSync(typingsDir)) {
			return;
		}
		const filesToDelete = metadataFullNames.map((fullName) =>
			this.getFileNameForChannel(typingsDir, fullName)
		);
		return deleteFiles(filesToDelete);
	}

	async deleteForProject(project: SfdxProject): Promise<any> {
		const typingsFolder = await this.getFolder(project);
		if (existsSync(typingsFolder)) {
			return promises.rm(typingsFolder, { recursive: true, force: true });
		}
	}

	private async getFolder(project: SfdxProject): Promise<string> {
		const baseTypingsDir = await getTypingsDir(project);
		const typingsFolder = join(baseTypingsDir, "message_channels");
		mkdirs(typingsFolder);
		return typingsFolder;
	}

	private getFileNameForChannel(
		typingsDir: string,
		messageChannelOrFile: string
	): string {
		let messageChannel = getFileNameWithoutExtension(
			messageChannelOrFile,
			FILE_EXTENSIONS.MESSAGE_CHANNEL_METADATA_FILE
		);
		return join(typingsDir, `${messageChannel}.d.ts`);
	}
}

interface MessageChannel {
	label: string;
	description: string;
	fullName: string;
}
