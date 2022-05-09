import {DescribeSObjectResult, Field} from "jsforce";

export default interface IFieldTypingsGenerator {
	generateTypings(sObjectDescribe:DescribeSObjectResult, field:Field):string
}
