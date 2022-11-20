import { DescribeSObjectResult, Field } from "jsforce";
import AFieldTypingsGenerator from "./AFieldTypingsGenerator";

export default class StandardFieldTypingsGenerator extends AFieldTypingsGenerator {
	generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string {
		return `${this.generateJsDocs(sObjectDescribe, field)}\t\t${
			field.name
		}?: ${this.getJsType(field)};\n`;
	}
	getJsType(field: Field): string {
		switch (field.type) {
			case "int":
				return "apex.Integer";
			case "double":
			case "percent":
				return "apex.Double";
			case "currency":
				return "apex.Decimal";
			case "date":
				return "apex.Date";
			case "datetime":
			case "base64":
			case "id":
				return "apex.Id";
			case "textarea":
			case "phone":
			case "url":
			case "string":
			case "email":
			case "multipicklist":
			case "location": //TODO check
				return "string";
			case "boolean":
				return "apex.Boolean";
			case "address":
				return "apex.Address";
			default:
				return field.type.toString();
		}
	}
}
