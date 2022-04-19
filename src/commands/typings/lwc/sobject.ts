import {flags, SfdxCommand} from "@salesforce/command";
import {DescribeSObjectResult} from "jsforce";
import SchemaGenerator from "../../../SchemaGenerator";
import SObjectTypingsGenerator from "../../../SObjectTypingsGenerator";
import {join} from "path";

export default class GenerateSObjectTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	public static flagsConfig = {
		sobject: flags.string({
			char:"s",
			description:"Comma separated sObject names",
			required: true
		}),
		// depth: flags.integer({
		// 	char:"d",
		// 	description: "Depth of schema typings, max 5",
		// 	default: 1
		// })
	}

	async run() {
		this.ux.startSpinner("Generating typings for sobjects", "fetching describes")
		const typingsFolder = join(this.project.getPath(), ".sfdx", "lwc-typings")
		const schemaGenerator = new SchemaGenerator();
		const sObjectTypingsGenerator = new SObjectTypingsGenerator();
		const sObjects = this.flags.sobject.split(",")
			.map(s => s.trim())
		const describesMap = await this.fetchSObjectDefinitions(sObjects)

		this.ux.setSpinnerStatus("generating common typings")
		await schemaGenerator.generateCommonTypings(typingsFolder)

		for(const sObjectName of sObjects) {
			const describe = describesMap.get(sObjectName.toLowerCase())
			const realApiName = describe.name

			this.ux.setSpinnerStatus(`generating schema for ${realApiName}`)
			await schemaGenerator.generateSchemaTypings(realApiName, describesMap, typingsFolder)

			this.ux.setSpinnerStatus(`generating ts typings for ${realApiName}`)
			await sObjectTypingsGenerator.generateSObjectTypings(describe, typingsFolder)

			this.ux.log(realApiName)
		}
		this.ux.stopSpinner("Generated")
	}

	async fetchSObjectDefinitions(sObjects:string[]):Promise<Map<string,DescribeSObjectResult>> {
		const describesMap = new Map();
		for(const sObject of sObjects) {
			this.ux.setSpinnerStatus(`fetching ${sObject} describe`)
			const describe = await this.org.getConnection().describe(sObject)
			describesMap.set(describe.name.toLowerCase(), describe)
		}
		return describesMap;

	}
}
