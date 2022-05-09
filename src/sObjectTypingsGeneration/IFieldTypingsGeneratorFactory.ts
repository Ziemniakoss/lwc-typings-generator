import {DescribeSObjectResult, Field} from "jsforce";
import IFieldTypingsGenerator from "./fieldTypingsGenerators/IFieldTypingsGenerator";

export default interface IFieldTypingsGeneratorFactory {
	getFieldTypingsGenerator(sObjectDescribe:DescribeSObjectResult, field:Field):IFieldTypingsGenerator
}
