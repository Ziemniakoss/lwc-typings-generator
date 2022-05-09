import { DescribeSObjectResult } from "jsforce";
import { join } from "path";
import { existsSync, promises } from "fs";
import {mkdirs} from "./utils/filesUtils";

export default class SchemaGenerator {
	async generateSchemaTypings(
		sObjectName: string,
		describesMap: Map<string, DescribeSObjectResult>,
		typingsFolder: string
	) {
		const describe = describesMap.get(sObjectName.toLowerCase());

		let typings = "";
		for (const field of describe.fields) {
			typings +=
				`declare module "@salesforce/schema/${describe.name}.${field.name}" {\n` +
				`\t const ${field.name}: FieldId\n` +
				`\t export default ${field.name}\n` +
				`}\n`;
		}
		const schemaFolder = await this.getSchemaFolder(typingsFolder);
		const fullPath = join(schemaFolder, `${describe.name}.d.ts`);
		return promises.writeFile(fullPath, typings);
	}

	async generateCommonTypings(typingsFolder: string) {
		const schemaFolder = await this.getSchemaFolder(typingsFolder);
		if (!existsSync(schemaFolder)) {
			await promises.mkdir(schemaFolder);
		}
		const typings =
			"declare interface ObjectId {\n" +
			"\tobjectApiName: string\n" +
			"}\n" +
			"declare interface FieldId {\n" +
			"\tfieldApiName: string;\n" +
			"\tobjectApiName: string\n" +
			"}\n";
		return promises.writeFile(join(schemaFolder, "common-types.d.ts"), typings);
	}

	async getSchemaFolder(typingsFolder: string): Promise<string> {
		const folder = join(typingsFolder, "schema");
		mkdirs(folder)
		return folder;
	}
}
