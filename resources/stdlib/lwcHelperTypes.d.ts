declare namespace schema {
	declare interface ObjectIdFromSchema<SObjectApiName> {
		objectApiName: SObjectApiName;
	}

	declare interface FieldIdFromSchema<SObjectApiName, FieldApiName> {
		fieldApiName: FieldApiName;
		objectApiName: SObjectApiName;
	}

	/**
	 * Helper type created for use with getPicklistValues.
	 * Proper typings for getPicklistValues are created BUT they
	 * - can't be used in JsDocs, only TypeScript
	 * - can detonate autocomplete function in IDE (Webstorm can't even read it and VS Code is struggling)
	 *
	 * So when you are using getPicklistValues with wire annotation, please mark its type as
	 * ```ts
	 * Wired<schema.PicklistValues<"Account", "Type">
	 * ```
	 * type to property
	 *
	 * If you read that, and you know how to fix it, please help me.
	 */
	declare type PicklistValues<
		SObjectApiName extends schema.SObjectApiName,
		FieldApiName extends keyof schema.SObjectMap[SObjectApiName]
	> = uiApiResponses.PicklistValues<
		schema.SObjectsMap[SObjectApiName][FieldApiName]
	>;
}
