declare module uiApiRequests {
	declare interface RecordInput<T extends schema.SObjectApiName> {
		/**
		 * For updates this field is not required
		 */
		apiName?: T;
		fields: Partial<Record<keyof schema.SObjectsMap[T], any>>;
	}
}
