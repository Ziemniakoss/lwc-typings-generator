import { SfdxCommand } from "@salesforce/command";
import { ApexTypingsGenerator } from "../../../ApexTypingsGenerator";
import { join } from "path";
import { findAllFilesWithExtension } from "../../../utils/filesUtils";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		const sObjectNames = await this.getAllSObjectNames();
		const typignsPath = join(this.project.getPath(), ".sfdx", "lwc-typings");
		const generator = new ApexTypingsGenerator(
			sObjectNames,
			this.org.getConnection()
		);
		const apexClassesOrPaths = await findAllFilesWithExtension(
			this.project.getPath(),
			".cls"
		);
		const generationPromises = []
		for (const classOrPath of apexClassesOrPaths) {
			const generationPromise =generator.generateTypings(classOrPath, typignsPath);
			generationPromises.push(generationPromise)
		}
		await Promise.all(generationPromises)
		this.ux.stopSpinner("have fun!");
	}

	async getAllSObjectNames(): Promise<string[]> {
		const globalDescribe = await this.org.getConnection().describeGlobal();
		return globalDescribe.sobjects.map((sObject) => sObject.name.toLowerCase());
	}
}
