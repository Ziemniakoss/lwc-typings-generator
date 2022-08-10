import { DescribeSObjectResult } from "jsforce";
import { join } from "path";
import {  promises } from "fs";
import { mkdirs } from "./utils/filesUtils";

export default class SchemaGenerator {
	async generateSchemaTypings(
		sObjectName: string,
		describesMap: Map<string, DescribeSObjectResult>,
		typingsFolder: string
	) {
		const describe = describesMap.get(sObjectName.toLowerCase());

		const schemaFolder = this.getSchemaFolder(typingsFolder);
		const fullPath = join(schemaFolder, `${describe.name}.d.ts`);
		await promises.writeFile(fullPath, "")

		for (const field of describe.fields) {
			const fieldApiName = field.name
			const typings = `
declare module "@salesforce/schema/${describe.name}.${fieldApiName}" {
	const ${fieldApiName}: schema.FieldIdFromSchema<"${describe.name}", "${fieldApiName}">
	export default ${fieldApiName}
}`
			await promises.appendFile(fullPath, typings)
		}
	}

	getSchemaFolder(typingsFolder: string): string {
		const folder = join(typingsFolder, "schema");
		mkdirs(folder);
		return folder;
	}
}
