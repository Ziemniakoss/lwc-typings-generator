declare module uiApiRequests {
	declare interface RecordInput<T extends schema.SObjectApiName> {
		apiName: T;
		fields: Partial<Record<keyof schema.SObjectsMap[T], any>>;
	}
}
