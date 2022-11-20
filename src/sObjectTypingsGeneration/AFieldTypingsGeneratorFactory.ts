import { DescribeSObjectResult, Field } from "jsforce";
import AFieldTypingsGenerator from "./fieldTypingsGenerators/AFieldTypingsGenerator";

export default interface IFieldTypingsGeneratorFactory {
	getFieldTypingsGenerator(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): AFieldTypingsGenerator;
}
