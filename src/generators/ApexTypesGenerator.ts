import ITypingGenerator from "./ITypingGenerator";
import { Connection } from "jsforce";
import { SfdxProject } from "@salesforce/core";
import {
	findAllFilesWithExtension,
	getTypingsDir,
	mkdirs,
} from "../utils/filesUtils";
import { FILE_EXTENSIONS, METADATA_TYPES } from "../utils/constants";
import { groupBy, wrapInArray } from "../utils/collectionUtils";
import { basename, join } from "path";
import { existsSync, promises } from "fs";
import IWiredMethodsTypesGenerator from "./apexTypesGeneration/IWiredMethodsTypesGenerator";
import WiredMethodsTypesGenerator from "./apexTypesGeneration/WiredMethodsTypesGenerator ";

/**
 * Generates typings for Apex classes using Antlr grammar
 */
export default class ApexTypesGenerator implements ITypingGenerator {
	constructor(
		private sObjectApiNames: string[] | null = null,
		private wiredTypesGenerator: IWiredMethodsTypesGenerator = new WiredMethodsTypesGenerator()
	) {}

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
		if (this.sObjectApiNames == null) {
			await this.initializeSObjectNamesCache(connection);
		}
		const typings =
			await this.wiredTypesGenerator.generateWiredMethodTypingsForFile(
				filePath,
				this.sObjectApiNames
			);
		const typingsFolder = await getTypingsDir(project);
		const apexTypingsFolder = join(typingsFolder, "apex");
		await mkdirs(apexTypingsFolder);
		const classTypingsFile = join(
			apexTypingsFolder,
			`${basename(filePath).replace(".cls", "")}.d.ts`
		);
		console.log(typings);
		return promises.writeFile(classTypingsFile, typings);
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
		if (deleteExisting) {
			await this.deleteForProject(project); //TODO better async
		}
		const [apexFilesMap, allApexClassesNames] = await Promise.all([
			this.getLocalApexFiles(project),
			connection.metadata
				.list({ type: METADATA_TYPES.APEX_CLASS })
				.then(wrapInArray),
			this.initializeSObjectNamesCache(connection),
		]);
		const apexClassesToGenerateFromApi = [];
		for (const apexClass of allApexClassesNames) {
			const { fullName } = apexClass;
			if (!apexFilesMap.has(fullName)) {
				apexClassesToGenerateFromApi.push(fullName);
			}
		}
		const typeGenerationPromises: Promise<any>[] = [];

		await this.generateForFile(
			project,
			connection,
			"/home/przemek/WebstormProjects/lwc-typings-generator/force-app/main/default/classes/TestCl.cls"
		);
		//TODO uncomment
		// for(const apexClassFilePath of apexFilesMap.values()) {
		// 	typeGenerationPromises.push(this.generateForFile(project,connection,apexClassFilePath))
		// }
		// if(apexClassesToGenerateFromApi.length > 0) {
		// 	typeGenerationPromises.push(this.generateForMetadata(project,connection, apexClassesToGenerateFromApi))
		// }
		return Promise.all(typeGenerationPromises);
	}

	/**
	 * Find all apex files in project folder and group them by Apex class name
	 * @param project SFDX project to search Apex files for
	 * @private
	 * @return map in which:
	 * - keys are names of apex classes
	 * - values are paths to local file with apex class definition
	 */
	private async getLocalApexFiles(
		project: SfdxProject
	): Promise<Map<string, string>> {
		const keyCalculator = (file) => basename(file).replace(".cls", "");
		return findAllFilesWithExtension(
			project.getPath(),
			FILE_EXTENSIONS.APEX_CLASS
		).then((apexFile) => groupBy(apexFile, keyCalculator));
	}

	private async initializeSObjectNamesCache(connection: Connection) {
		if (this.sObjectApiNames != null) {
			return;
		}
		const globalDescribe = await connection.describeGlobal();
		this.sObjectApiNames = globalDescribe.sobjects.map((sObjectData) =>
			sObjectData.name.toLowerCase()
		);
	}
}
