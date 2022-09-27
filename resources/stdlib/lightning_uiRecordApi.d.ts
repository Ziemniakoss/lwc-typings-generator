declare module "lightning/uiRecordApi" {
	export async function createRecord<T extends schema.SObjectApiName>(
		record: uiApiRequests.RecordInput<T>
	): uiApiResponses.Record<T>;

	/**
	 * Creates a RecordInput object with a list of fields that have been edited from their original values to pass in a call to updateRecord(recordInput).
	 *
	 * @param recordInput
	 * @param originalRecord
	 * @return     An object with a list of fields that have been edited from their original values (excluding Id which is always included).
	 */
	export async function createRecordInputFilteredByEditedFields<
		Obj extends schema.SObjectApiName
	>(
		recordInput: uiApiRequests.RecordInput<Obj>,
		originalRecord: uiApiResponses.Record<Obj>
	): uiApiResponses.Record<Obj>;

	export async function deleteRecord(recordId: apex.Id);

	/**
	 * @param record  A Record object that contains source data.
	 * To get data to build the Record object, use the getRecordCreateDefaults or getRecord.
	 *
	 * @param objectInfo (Optional) The ObjectInfo corresponding to the apiName on the record.
	 * If provided, only fields that are createable=true (excluding Id) are included in the response.
	 */
	export async function generateRecordInputForCreate<Obj>(
		record: uiApiResponses.Record<Obj>,
		objectInfo: uiObjectInfoApiResponses.ObjectInfo<
			schema.SObjectsMap[Obj]
		> = null
	): uiApiRequests.RecordInput<Obj>;

	/**
	 * @param record A Record object that contains source data.
	 * To get data to build the Record object, use the getRecord wire adapters.
	 *
	 * @param objectInfo The ObjectInfo corresponding to the apiName on the record.
	 * To get the object info, use the getObjectInfo wire adapter.
	 * If provided, only fields that are updateable=true (excluding Id) are included in the response.
	 */
	export async function generateRecordInputForUpdate<Obj>(
		record: uiApiResponses.Record<Obj>,
		objectInfo: uiObjectInfoApiResponses.ObjectInfo<
			schema.SObjectsMap[Obj]
		> = null
	): uiApiRequests.RecordInput<Obj>;

	export function getFieldValue<
		O extends schema.SObjectApiName,
		F extends keyof schema.SObjectsMap[O]
	>(
		record: uiApiResponses.Record<O>,
		field: F | schema.FieldIdFromSchema<O, F>
	): schema.SObjectsMap[O][F] | undefined;

	export function getFieldDisplayValue<
		O extends schema.SObjectApiName,
		F extends keyof schema.SObjectsMap[O]
	>(
		record: uiApiResponses.Record<O>,
		field: F | schema.FieldIdFromSchema<O, F>
	): string;

	export async function getRecord<
		Obj extends schema.SObjectApiName,
		F extends keyof schema.SObjectsMap[Obj]
	>(wireConfig: {
		recordId: apex.Id;
		fields: (schema.FieldIdFromSchema<Obj, F> | string)[];
		optionalFields?: (schema.FieldIdFromSchema<Obj, F> | string)[];
	}): Promise<uiApiResponses.Record<Obj>>;

	export async function getRecord<
		Obj extends schema.SObjectApiName
	>(wireConfig: {
		recordId: apex.Id;
		layoutTypes: "Compact" | "Full";
		modes?: "Create" | "Edit" | "View";
	}): Promise<uiApiResponses.Record<Obj>>;

	interface GetRecordsSingleConfig<Obj> {
		/**
		 * Ids of records with same SObject type
		 */
		recordIds: string[];
		fields: schema.FieldIdFromSchema<Obj, any>[];
		optionalFields?: schema.FieldIdFromSchema<Obje, any>[];
	}

	interface GetRecordsConfig {
		records: GetRecordsSingleConfig<schema.SObjectApiName>[];
	}

	/**
	 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/reference_wire_adapters_records)
	 */
	export async function getRecords(
		config: GetRecordsConfig
	): Promise<uiApiResponses.BatchResults>;

	export async function getRecordCreateDefaults<
		Obj extends schema.SObjectApiName
	>(config: {
		objectApiName: Obj;
		formFactor?: "Large" | "Medium" | "Small";
		recordTypeId?: apex.Id;
		optionalFields?; //TODO
	}): Promise<uiApiResponses.RecordDefaults<Obj>>;

	/**
	 * Notify LDS that you changed record outside of LDS fuctionality.
	 * This will refresh updated records in other places.
	 */
	function getRecordNotifyChange(
		recordsChangedOutsideOfLds: [{ recordId: apex.Id }]
	);

	//TODO better typings for input https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_update_record
	export async function updateRecord<Obj extends schema.SObjectApiName>(
		recordInput: uiApiRequests.RecordInput<Obj>
	): Promise<uiApiResponses.Record<Obj>>;
}
