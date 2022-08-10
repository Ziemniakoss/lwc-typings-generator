declare namespace schema {
	declare interface ObjectIdFromSchema<SObjectApiName> {
		objectApiName:SObjectApiName
	}

	declare interface FieldIdFromSchema<SObjectApiName, FieldApiName> {
		fieldApiName: FieldApiName;
		objectApiName: SObjectApiName;
	}
}
