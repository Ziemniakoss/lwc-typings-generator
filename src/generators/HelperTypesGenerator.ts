import { Connection } from "jsforce";
import { SfdxProject } from "@salesforce/core";
import { join } from "path";
import { getTypingsDir, mkdirs } from "../utils/filesUtils";
import ITypingGenerator from "./ITypingGenerator";
import IHelperTypesGenerator from "./helperTypesGenerators/IHelperTypesGenerator";
import TabsHelperTypesGenerator from "./helperTypesGenerators/TabsHelperTypesGenerator";
import { existsSync, promises } from "fs";
import SObjectHelperTypesGenerator from "./helperTypesGenerators/SObjectHelperTypesGenerator";
// import MessageChannelsPayloadsHelperTypesGenerator from "./helperTypesGenerators/MessageChannelsPayloadsHelperTypesGenerator";
import ApplicationsHelperTypesGenerator from "./helperTypesGenerators/ApplicationsHelperTypesGenerator";
import FlowHelperTypesGenerator from "./helperTypesGenerators/FlowHelperTypesGenerator";
import GlobalValueSetHelperTypesGenerator from "./helperTypesGenerators/GlobalValueSetHelperTypesGenerator";

export class HelperTypesGenerator implements ITypingGenerator {
	private helperTypesGenerators: IHelperTypesGenerator[];

	constructor(helperTypesGenerators?: IHelperTypesGenerator[]) {
		if (helperTypesGenerators == null) {
			this.helperTypesGenerators = [
				new TabsHelperTypesGenerator(),
				new SObjectHelperTypesGenerator(),
				// new MessageChannelsPayloadsHelperTypesGenerator(),
				new ApplicationsHelperTypesGenerator(),
				new FlowHelperTypesGenerator(),
				new GlobalValueSetHelperTypesGenerator(),
			];
		} else {
			this.helperTypesGenerators = helperTypesGenerators;
		}
	}

	private async getHelperTypesFolder(
		project: SfdxProject,
		createIfNotExists = true
	): Promise<string> {
		const typingsFolder = await getTypingsDir(project);
		const helperTypesFolder = join(typingsFolder, "helper");
		if (createIfNotExists) {
			mkdirs(helperTypesFolder);
		}
		return helperTypesFolder;
	}

	async deleteForProject(project: SfdxProject): Promise<any> {
		const rootTypingsDir = await this.getHelperTypesFolder(project, false);
		if (existsSync(rootTypingsDir)) {
			return promises.rm(rootTypingsDir, { force: true, recursive: true });
		}
	}

	async generateForProject(
		project: SfdxProject,
		connection: Connection,
		deleteExisting: boolean
	): Promise<any> {
		if (deleteExisting) {
			await this.deleteForProject(project);
		}
		const rootTypingsDir = await this.getHelperTypesFolder(project);
		const promises = this.helperTypesGenerators.map((generator) =>
			generator.generateForProject(project, rootTypingsDir, connection)
		); //TODO maybe allow deletion?
		return Promise.all(promises);
	}

	generateForFile(
		project: SfdxProject,
		connection: Connection,
		filePath: string
	): Promise<any> {
		//Operation is not supported
		return;
	}

	generateForMetadata(
		project: SfdxProject,
		connection: Connection,
		metadataFullNames: string[]
	): Promise<any> {
		//Operation is not supported
		return;
	}

	deleteForMetadata(
		project: SfdxProject,
		metadataFullNames: string[]
	): Promise<any> {
		//Operation is not supported
		return;
	}

	deleteForFile(project: SfdxProject, filePath: string): Promise<any> {
		// Not supported
		return;
	}
}
