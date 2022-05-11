import IFieldTypingsGenerator from "./fieldTypingsGenerators/IFieldTypingsGenerator";
import { DescribeSObjectResult, Field } from "jsforce";
import RecordTypeDevNameFieldTypingsGenerator from "./fieldTypingsGenerators/RecordTypeDevNameFieldTypingsGenerator";
import ReferenceFieldTypingsGenerator from "./fieldTypingsGenerators/ReferenceFieldTypingsGenerator";
import PicklistFieldTypingsGenerator from "./fieldTypingsGenerators/PicklistFieldTypingsGenerator";
import StandardFieldTypingsGenerator from "./fieldTypingsGenerators/StandardFieldTypingsGenerator";
import IFieldTypingsGeneratorFactory from "./IFieldTypingsGeneratorFactory";

export default class FieldTypingsGeneratorFactory
	implements IFieldTypingsGeneratorFactory
{
	getFieldTypingsGenerator(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): IFieldTypingsGenerator {
		if (sObjectDescribe.name == "RecordType" && field.name == "DeveloperName") {
			return new RecordTypeDevNameFieldTypingsGenerator();
		}
		if (field.type == "reference") {
			return new ReferenceFieldTypingsGenerator();
		}
		if (field.type == "picklist") {
			return new PicklistFieldTypingsGenerator();
		}
		return new StandardFieldTypingsGenerator();
	}
}
