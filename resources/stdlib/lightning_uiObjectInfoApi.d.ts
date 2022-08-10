declare module "lightning/uiObjectInfoApi" {
	import {uiApiResponses} from "./uiApiResponses";

	export function getObjectInfo<SObject>():Promise<uiApiResponses.ObjectInfo<SObject>>

	export function getObjectInfos():Promise<uiApiResponses.ObjectInfo<any>[]> //TODO better typings

	interface GetPicklistValuesConfig<T> {
		recordTypeId:apex.Id | "012000000000000AAA"
		fieldApiName: schema.FieldIdFromSchema | string
		propertyOrFunction?

	}


	declare type PicklistValuesFromField<T extends schema.FieldIdFromSchema> = schema.SObjectsMap[T["objectApiName"]][T["fieldApiName"]]
	export function getPicklistValues<T extends schema.FieldIdFromSchema>(
		config:GetPicklistValuesConfig<T>
	):Promise<uiApiResponses.PicklistValues<PicklistValuesFromField<T>>>

	export function getPicklistValues(config:GetPicklistValuesConfig<string>):Promise<uiApiResponses.PicklistValues<any>>
}

