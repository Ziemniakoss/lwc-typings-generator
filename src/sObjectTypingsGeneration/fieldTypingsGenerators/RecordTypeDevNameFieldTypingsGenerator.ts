import IFieldTypingsGenerator from "./IFieldTypingsGenerator";
import {DescribeSObjectResult, Field} from "jsforce";

export default class RecordTypeDevNameFieldTypingsGenerator implements IFieldTypingsGenerator {
	generateTypings(sObjectDescribe: DescribeSObjectResult, field: Field): string {
		return `\t\tDeveloperName: T;\n`;
	}
}
