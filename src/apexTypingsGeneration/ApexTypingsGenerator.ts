import { basename, join } from "path";
import { findAllFilesWithExtension, mkdirs } from "../utils/filesUtils";
import { Connection } from "jsforce";
import { promises } from "fs";
import { getParser } from "../utils/apexParsingUtils";
import IWiredMethodsTypingsGenerator from "./wiredMethodsTypingsGeneration/IWiredMethodsTypingsGenerator";
import IApexClassTypingsGenerator from "./apexClassesTypingsGeneration/IApexClassTypingsGenerator";
import IApexTypingsGenerator from "./IApexTypingsGenerator";
import { SfdxProject } from "@salesforce/core";

export class ApexTypingsGenerator implements IApexTypingsGenerator {
	constructor(
		private readonly wiredMethodsTypingsGenerator: IWiredMethodsTypingsGenerator,
		private readonly apexClassTypingsGenerator: IApexClassTypingsGenerator
	) {}

	async generateTypingsForProject(
		connection: Connection,
		project: SfdxProject
	) {
		const sObjectNames = await this.getAllSObjectNames(connection);
		const typignsPath = join(project.getPath(), ".sfdx", "lwc-typings");
		const apexClassesOrPaths = await findAllFilesWithExtension(
			project.getPath(),
			".cls"
		);
		const generationPromises = [];
		for (const classOrPath of apexClassesOrPaths) {
			const generationPromise = this.generateTypingsForPath(
				sObjectNames,
				classOrPath,
				typignsPath
			);
			generationPromises.push(generationPromise);
		}
		return Promise.all(generationPromises);
	}

	generateTypingsForNamespace(
		namespace: string | null,
		typingsFolder: string,
		connection: Connection
	): Promise<any> {
		throw new Error("Not implemented yet");
	}

	async generateTypingsForPath(
		sObjectNames: string[],
		path: string,
		typingsFolder: string
	): Promise<any> {
		const fileName = basename(path);
		const className = fileName.substring(0, fileName.lastIndexOf("."));
		const parsedClass = await Promise.all([
			promises.readFile(path, "utf-8"),
			getParser(),
		]).then(([classContent, parser]) => parser.parse(classContent));
		return this.generate(
			sObjectNames,
			null,
			className,
			typingsFolder,
			parsedClass
		);
	}

	async generate(
		sObjectNames: string[],
		namespace: string | null,
		className: string,
		typingsFolder: string,
		parsedClass
	) {
		const typings = await Promise.all([
			this.apexClassTypingsGenerator.generateClassTypings(
				sObjectNames,
				namespace,
				className,
				parsedClass
			),
			this.wiredMethodsTypingsGenerator.generateWiredMethodsTypings(
				sObjectNames,
				namespace,
				className,
				parsedClass
			),
		]).then((results) => results.join("\n"));

		const folder = join(typingsFolder, "apex");
		mkdirs(folder);
		const filePrefix = namespace != null ? `${namespace}.` : "";
		const filePath = join(folder, `${filePrefix}${className}.d.ts`);
		return promises.writeFile(filePath, typings);
	}

	async getAllSObjectNames(connection: Connection): Promise<string[]> {
		const globalDescribe = await connection.describeGlobal();
		return globalDescribe.sobjects.map((sObject) => sObject.name);
	}
}
