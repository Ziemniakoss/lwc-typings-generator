import { basename, join } from "path";
import { mkdirs } from "../utils/filesUtils";
import { Connection } from "jsforce";
import { promises } from "fs";
import { getParser } from "../utils/apexParsingUtils";
import IWiredMethodsTypingsGenerator from "./wiredMethodsTypingsGeneration/IWiredMethodsTypingsGenerator";
import IApexClassTypingsGenerator from "./apexClassesTypingsGeneration/IApexClassTypingsGenerator";
import IApexTypingsGenerator from "./IApexTypingsGenerator";

export class ApexTypingsGenerator implements IApexTypingsGenerator {
	constructor(
		// @ts-ignore
		private readonly connection: Connection,
		private readonly wiredMethodsTypingsGenerator: IWiredMethodsTypingsGenerator,
		private readonly apexClassTypingsGenerator: IApexClassTypingsGenerator
	) {}

	generateTypingsForNamespace(
		namespace: string | null,
		typingsFolder: string,
		connection: Connection
	): Promise<any> {
		throw new Error("Not implemented yet");
	}

	async generateTypingsForPath(
		path: string,
		typingsFolder: string
	): Promise<any> {
		const fileName = basename(path);
		const className = fileName.substring(0, fileName.lastIndexOf("."));
		const parsedClass = await Promise.all([
			promises.readFile(path, "utf-8"),
			getParser(),
		]).then(([classContent, parser]) => parser.parse(classContent));
		return this.generate(null, className, typingsFolder, parsedClass);
	}

	async generate(
		namespace: string | null,
		className: string,
		typingsFolder: string,
		parsedClass
	) {
		const typings = await Promise.all([
			this.apexClassTypingsGenerator.generateClassTypings(
				namespace,
				className,
				parsedClass
			),
			this.wiredMethodsTypingsGenerator.generateWiredMethodsTypings(
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
}
