/**
 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_related_list)
 */
declare module "lightning/uiRelatedListApi" {
	/**
	 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_get_related_list_info)
	 */
	export function getRelatedListInfo<T extends schema.SObjectApiName>(config:{
		parentObjectApiName:T,
		relatedListId?: keyof schema.SObjectsMap[T],
		recordTypeId?:apex.Id

	}):Promise<uiApiResponses.RelatedListInfo>

	/**
	 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_get_related_list_info_batch)
	 */
	export function getRelatedListInfo<T extends schema.SObjectApiName>(config:{
		parentObjectApiName:T,
		relatedListNames:(keyof  schema.SObjectsMap[T])[]

	}):Promise<uiApiResponses.SimplifiedBatchResults>

	/**
	 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_get_related_list_records)
	 */
	export function getRelatedListInfo<T extends schema.SObjectApiName>(config:{
		parentRecordId:apex.Id
		/**
		 * The API name of a related list object, like Contacts, Opportunities, or Cases.
		 */
		relatedListId:string,
		fields?:schema.FieldIdFromSchema<any, any>[],
		optionalFields?:schema.FieldIdFromSchema<any, any>[],
		pageSize?:number
		sortBy?:schema.FieldIdFromSchema<any, any>[],
		/**
		 * The filter to apply to related list records, in GraphQL syntax.
		 */
		where?

	}):Promise<uiApiResponses.RelatedListRecordCollection>
}
