interface ChildRelationship {
	childObjectApiName: string
	fieldName: string
	junctionIdListNames: string[]
	junctionReferenceTo: string[]
	relationshipName: string
}

interface FilteredLookupInfo {
	controllingFields:string[]
	dependent:boolean
	optionalFilter:boolean
}

interface ReferenceToInfo {
	apiName:string
	nameFields:string[]
}

interface Field {
	apiName: string
	calculated: boolean
	compound: boolean
	compoundComponentName: string
	compoundFieldName: string
	controllerName: string
	controllingFields: string[]
	createable: boolean
	custom: boolean
	dataType: "Address"
		| "Base64"
		| "Boolean"
		| "Combobox"
		| "ComplexValue"
		| "Currency"
		| "Date"
		| "DateTime"
		| "Double"
		| "Email"
		| "EncryptedString"
		| "Int"
		| "Location"
		| "MultiPicklist"
		| "Percent"
		| "Phone"
		| "Picklist"
		| "Reference"
		| "String"
		| "TextArea"
		| "Time"
		| "Url"
	extraTypeInfo: "ExternalLookup"
	| "ImageUrl"
	| "IndirectLookup"
	| "PersonName"
	| "PlainTextArea"
	| "RichTextArea"
	| "SwitchablePersonName"
	filterable:boolean
	filteredLookupInfo?:FilteredLookupInfo
	highScaleNumber:boolean
	htmlFormatted:boolean
	inlineHelpText:string
	label:string
	length:apex.Integer
	nameField:boolean
	polymorphicForeignKey:boolean
	precision:apex.Integer
	reference:boolean
	referenceTargetField:string
	referenceToInfos: ReferenceToInfo[]
	relationshipName:string
	required:boolean
	searchPrefilterable:boolean
	scale:apex.Integer
	sortable:boolean
	unique:boolean
	updateable:boolean

}

interface RecordTypeInfo {
	available: boolean
	defaultRecordTypeMapping: boolean
	master: boolean
	name: string
	recordTypeId: apex.Id
}

interface ThemeInfo {
	color: string
	iconUrl: string
}

declare interface ObjectInfo<SObject> {
	apiName: string
	associateEntityType: string
	associateParentEntity: string
	childRelationships: ChildRelationship[]
	createable: boolean
	custom: boolean
	defaultRecordTypeId: "012000000000000AAA" | string
	/**
	 * @deprecated use deletable
	 */
	deleteable: boolean
	deletable: boolean
	dependentFields: Record<string, object>
	feedEnabled: boolean
	fields: Record<keyof SObject, Field>
	keyPrefix: string
	label: string
	labelPlural: string
	layoutable: boolean
	mruEnabled: boolean
	nameFields: string[]
	queryable: boolean
	/**
	 * id to record type info
	 */
	recordTypeInfos: Record<string, RecordTypeInfo>
	searchable: boolean
	themeInfo: ThemeInfo
	updateable: boolean
}

declare module "lightning/uiObjectInfoApi" {
	export function getObjectInfo<T>(config:{objectApiName:schema.SObjectApiName}):Promise<ObjectInfo<T>>
	export function getObjectInfo<T>(config:{objectApiName:ObjectId}):Promise<ObjectInfo<T>>
}
