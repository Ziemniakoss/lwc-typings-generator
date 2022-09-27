/**
 * [Docs for namesapce](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_top_level.htm)
 */
declare namespace uiApiResponses {
	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_child_relationship.htm#ui_api_responses_child_relationship
	 */
	declare interface ChildRelationship {
		childObjectApiName: string; //TODO better types
		fieldName: string;
		junctionIdListNames: string[];
		junctionReferenceTo: string[];
		relationshipName: string;
	}

	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_filtered_lookup_info.htm#ui_api_responses_filtered_lookup_info
	 */
	declare interface FilteredLookupInfo {
		controllingFields: string[];
		dependent: boolean;
		optionalFilter: boolean;
	}

	type DataType =
		| "Address"
		| "Base64"
		| "Boolean"
		| "ComboBox"
		| "ComplexValue"
		| "Currency"
		| "Date"
		| "DateTime"
		| "Double"
		| "Email"
		| "EncryptedString"
		| "Int"
		| "MultiPicklist"
		| "Percent"
		| "Phone"
		| "Picklist"
		| "Reference"
		| "String"
		| "TextArea"
		| "Time"
		| "Url";

	type ExtraTypeInfo =
		| "ExternalLookup"
		| "ImageUrl"
		| "IndirectLookup"
		| "PersonName"
		| "PlainTextArea"
		| "RichTextArea"
		| "SwitchablePersonName";

	declare interface ReferenceToInfo {
		apiName: string;
		nameFields: string[];
	}

	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_field.htm#ui_api_responses_field
	 */
	declare interface Field {
		apiName: string;
		calculated: boolean;
		compound: boolean;
		compoundComponentName: string;
		compoundFieldName: string;
		controllerName: string;
		controllingFields: string[];
		createable: boolean;
		custom: boolean;
		dataType: DataType;
		extraTypeInfo: ExtraTypeInfo;
		filterable: boolean;
		filteredLookupInfo: FilteredLookupInfo;
		highScaleNumber: boolean;
		htmlFormatted: boolean;
		inlineHelpText: string;
		label: string;
		length: number;
		nameField: boolean;
		polymorphicForeignKey: boolean;
		precision: number;
		reference: boolean;
		referenceTargetField: string;
		referenceToInfos: ReferenceToInfo[];
		relationshipName: string;
		required: boolean;
		searchPrefilterable: boolean;
		scale: number;
		sortable: boolean;
		unique: boolean;
		updateable: boolean;
	}

	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_type_info.htm#ui_api_responses_record_type_info
	 */
	declare interface RecordTypeInfo {
		available: boolean;
		defaultRecordTypeMapping: boolean;
		master: boolean;
		/**
		 * RECORD TYPE LABEL!!!!! NOT DEV NAME!!!!!
		 */
		name: string;
		recordTypeId: apex.Id;
	}
	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_object_info.htm
	 */
	declare interface ObjectInfo<SObject> {
		apiName: string;
		associateEntityType: string;
		associateParentEntity: string;
		childRelationships: ChildRelationship[];
		createable: boolean;
		custom: boolean;
		defaultRecordTypeId: "012000000000000AAA" | apex.Id;
		deleteable: boolean;
		dependentFields: any; //TODO better types
		feedEnabled: boolean;
		fields: Record<keyof SObject, Field>;
		keyPrefix: string;
		label: string;
		labelPlural: string;
		layoutable: boolean;
		mruEnabled: boolean;
		nameFields: ["Name"] | ["FirstName" | "LastName"];
		queryable: boolean;
		recordTypeInfos: Record<apex.Id, RecordTypeInfo>;
		searchable: boolean;
		themeInfo; //TODO
		updateable: boolean;
	}

	/**
	 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_value.htm#ui_api_responses_picklist_value
	 */
	declare interface PicklistValue<Values> {
		attributes: any; //TODO better
		label: string;
		validFor: number[];
		value: Values;
	}

	declare interface PicklistValues<Values> {
		controllerValues: any; //TODO
		defaultValue: PicklistValue<Values>;
		url: string;
		values: PicklistValue<Values>[];
	}

	declare interface Record<T extends schema.SObjectApiName> {
		apiName: T;
		childRelationships: R<string, uiApiResponses.RecordCollection>;
		eTag: string;
		weakEtag;
		fields: R<keyof schema.SObjectMap[T], FieldValue>;
		id: apex.Id;
		lastModifiedById: apex.Id;
		/**
		 * The date and time when a user last modified this record.
		 * Date and time information is in ISO 8601 format.
		 */
		lastModifiedDate: string;
		recordTypeId: apex.Id;
		recordTypeInfo: RecordTypeInfo;
		systemModstamp: string;
	}

	/**
	 * [docs](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_field_value.htm#ui_api_responses_field_value)
	 */
	declare interface FieldValue {
		displayValue: string;
		value;
	}

	declare interface RecordCollection {
		count: number;
		currentPageToken: string;
		currentPageUrl: string;
		nextPageToken: string;
		nextPageUrl: string;
		previousPageUrl: string;
		records: uiApiResponses.Record<any>; //TODO what?
	}

	declare interface RelatedListColumn {
		fieldApiName: string;
		label: string;
		lookupId: string;
		sortable: boolean;
	}

	declare interface ListFilterByInfo {
		fieldApiName: string;
		label: string;
		operandLabels: string[];
		operator:
			| "Contains"
			| "Equals"
			| "Excludes"
			| "GreaterOrEqual"
			| "GreaterThan"
			| "Includes"
			| "LessOrEqual"
			| "LessThan"
			| "NotContain"
			| "NotEqual"
			| "StartsWith"
			| "Within";
	}

	declare interface ListOrderByInfo {
		fieldApiName: string;
		isAscending: boolean;
		label: string;
	}

	declare interface ListUserPreference {
		columnWidths: R<string, number>;
		columnWrap: R<string, number>;
	}

	declare interface RelatedListInfo {
		cloneable: boolean;
		creatable: boolean;
		deletable: boolean;
		displayColumns: uiApiResponses.RelatedListColumn[];
		fieldApiName: string;
		filterLogicString: string;
		filteredByInfo: uiApiResponses.ListFilterByInfo[];
		label: string;
		listReference: uiApiResponses.ListReference;
		objectApiNames: schema.SObjectApiName[];
		orderedByInfo: uiApiResponses.ListOrderByInfo[];
		updatable: boolean;
		userPreferences: uiApiResponses.ListUserPreference;
		visibility: string;
		visibilityEditable: boolean;
	}

	declare interface ListReference {
		id: apex.Id;
		listViewApiName: string;
		objectApiName: schema.SObjectApiName;
		type: string;
	}

	declare interface RelatedListRecordCount {
		count: number;
		hasMore: boolean;
		listReference: uiApiResponses.ListReference;
	}

	declare interface ErrorMessage {
		errorCode: string;
		message: string;
	}

	declare interface BatchResultItem {
		/**
		 * Http status code
		 */
		statusCode: number;
		result:
			| uiApiResponses.Record<any>
			| uiApiResponses.ErrorMessage
			| uiApiResponses.RelatedListInfo
			| uiApiResponses.RelatedListRecordCount;
	}

	/**
	 * [full docs](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_batch_results.htm#ui_api_responses_batch_results)
	 */
	declare interface BatchResults {
		hasErrors: boolean;
		results: BatchResultItem[];
	}

	declare interface RecordLayoutSaveOption {
		defaultValue: boolean;
		isDisplayed: boolean;
		label: string;
		name: string;
		restHeaderName: string;
		soapHeaderName: string;
	}

	declare interface RecordLayoutItem {
		editableForNem: boolean;
		editableForUpdate: boolean;
		label: string;
		layoutComponents; //TODO https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_layout_item.htm#ui_api_responses_record_layout_item
		lookupIdApiName: string;
		required: boolean;
		sortable: boolean;
	}

	declare interface RecordLayoutRow {
		layoutItems: RecordLayoutItem[];
	}

	declare interface RecordLayoutSection {
		collapsible: boolean;
		columns: number;
		heading: string;
		id: string;
		layoutRows: RecordLayoutRow[];
		rows: number;
		useHeading: boolean;
	}

	declare interface RecordLayout<Obj extends schema.SObjectApiName> {
		id: apex.Id;
		layoutType: "Compact" | "Full";
		mode: "Create" | "Edit" | "View";
		objectApiName: Obj;
		recordTypeId: apex.Id;
		saveOptions: RecordLayoutSaveOption[];
		sections: RecordLayoutSection[];
	}

	declare interface RecordDefaults<Obj extends schema.SObjectApiName> {
		layout: RecordLayout<Obj>;
		objectInfo: uiObjectInfoApiResponses.ObjectInfo<schema.SObjectsMap[Obj]>;
		objectInfos: uiObjectInfoApiResponses.ObjectInfo<any>[];
		record: Record<Obj>;
	}
}
type R<Key, Value> = Record<Key, Value>;
