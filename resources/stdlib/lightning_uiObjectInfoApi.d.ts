declare module "lightning/uiObjectInfoApi" {
	import {uiApiResponses} from "./uiApiResponses";

	export function getObjectInfo<SObject>():Promise<uiApiResponses.ObjectInfo<SObject>>

	export function getObjectInfos():Promise<uiApiResponses.ObjectInfo<any>[]> //TODO better typings

	interface GetPicklistValuesConfig {
		recordTypeId:apex.Id | "012000000000000AAA"
		fieldApiName:string | any //TODO better
		propertyOrFunction?

	}
	export function getPicklistValues<>(config:GetPicklistValuesConfig):Promise<uiApiResponses.PicklistValues<any>>



}

