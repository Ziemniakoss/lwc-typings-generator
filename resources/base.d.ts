interface Template {
	readonly activeElement: Element | null;

	readonly delegatesFocus: boolean;

	addEventListener(type: string, listener: Function, options);

	removeEventListener(type: string, listener: Function, options);

	querySelector<Query extends keyof LwcElementTadNameMap>(
		query: Query
	): LwcElementTadNameMap[Query] | null;

	querySelectorAll<Query extends keyof LwcElementTadNameMap>(
		query: Query
	): LwcElementTadNameMap[Query][];
}

class LwcComponentBase {
	dispatchEvent(evt: Event): boolean;

	connectedCallback(): void;

	disconnectedCallback(): void;

	renderedCallback(): void;

	errorCallback(error: Error, stack: string): void;

	/**
	 * Return custom template for component
	 */
	render(): any;

	readonly template: Template;
}

declare module "lwc" {
	/**
	 * Base class for the Lightning Web Component JavaScript class
	 */
	export class LightningElement extends LwcComponentBase {}

	/**
	 * Decorator to mark public reactive properties
	 */
	export const api: PropertyDecorator;

	/**
	 * Decorator to mark private reactive properties
	 */
	export const track: PropertyDecorator;

	export function wire<T>(
		getType: (params?: T) => any,
		config?: T //TODO maybe accept  $fieldName strings?
	): PropertyDecorator;
}

interface PageReference {}

interface AppTypePageReference extends PageReference {
	type: "standard__app";
	attributes: {
		appTarget: string; //TODO api names
		pageRef?: PageReference;
	};
}

/**
 * A page that interacts with an external record.
 * Currently supports CMS Connect pages.
 */
interface ExternalRecordPageType extends PageReference{
	type: "comm__externalRecordPage"
	attributes: {
		recordId: string
		objectType: "cms" // TODO add better explanation
		objectInfo
	}
}

interface NavigationItemPageReference extends PageReference {
	type: "standard__navItemPage";
	attributes: {
		apiName: Salesforce.TabApiName;
	};
}

/**
 * A page that interacts with an external relationship on a particular record in the org.
 * Currently only supports Quip Related List page.
 */
interface ExternalRecordRelationshipPageType extends PageReference {
	type: "comm__externalRecordRelationshipPage"
	attributes: {
		recordId: apex.Id
		objectType: "quip" //TODO exmplanation why only this value
	}
}

//TODO Navigation Item Page Type

interface ObjectPageTypePageReference extends PageReference {
	type: "standard__objectPage";
	attributes: {
		objectApiName: schema.SObjectApiName;
		actionName: "home" | "list" | "new";
	};
	state?: {
		filterName?: "Recent" | string;
		/**
		 * Example
		 * ```
		 *defaultFieldValues = 'AccountNumber=ACXXXX,CustomCheckbox__c=true,Name=Salesforce%2C%20%231%3DCRM,NumberOfEmployees=35000,OwnerId=005XXXXXXXXXXXXXXX',
		 * ```
		 */
		defaultFieldValues: string;

		nooverride?: "home" | "list" | "new" | "1";
	};
}

interface RecordPageTypePageReference extends PageReference {
	type: "standard__recordPage";
	attributes: {
		recordId: apex.Id;
		objectApiName?: string; //TODO better typings
		actionName: "view" | "clone" | "edit";
	};
}

interface RecordRelationshipPageTypePageReference extends PageReference {
	type: "standard__recordRelationshipPage";
	attributes: {
		actionName: "view";
		objectApiName: string; //TODO better typings
		recordId: apex.Id;
		relationshipApiName: string;
	};
}

interface WebPageTypePageReference extends PageReference {
	type: "standard__webPage";
	attributes: {
		url: string;
	};
}
class NavigableComponent extends LwcComponentBase {
	//TODO maybe simplify this with map?
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: AppTypePageReference);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: ExternalRecordPageType);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: NavigationItemPageReference);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: ExternalRecordRelationshipPageType);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: ObjectPageTypePageReference);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: RecordPageTypePageReference);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: RecordRelationshipPageTypePageReference);
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageReference: WebPageTypePageReference);
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: AppTypePageReference): Promise<string>;
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: ExternalRecordPageType);
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: NavigationItemPageReference);
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: ExternalRecordRelationshipPageType);
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: ObjectPageTypePageReference): Promise<string>;
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: RecordPageTypePageReference): Promise<string>;
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(
		pageReference: RecordRelationshipPageTypePageReference
	): Promise<string>;
	/**
	 * Don't use directly.
	 * Use only for reference.
	 * ```js
	 *this[NavigationMixin.GenerateUrl]({
	 *    type: 'standard__recordPage',
	 *    attributes
	 *}).then((url) => console.log(url)
	 * ```
	 */
	__generateUrl__(pageReference: WebPageTypePageReference): Promise<string>;
}

declare module "lightning/navigation" {
	declare namespace NavigationMixin {
		/**
		 * Don't use directly.
		 * Use only for reference
		 * ```js
		 *	this[NavigationMixin.GenerateUrl](pageReference)
		 *		.then(url => this.url = url);
		 * ```
		 */
		declare const Navigate = "__navigate__";
		/**
		 * Don't use directly.
		 * Use only for reference.
		 * ```js
		 *this[NavigationMixin.GenerateUrl]({
		 *    type: 'standard__recordPage',
		 *    attributes
		 *}).then((url) => console.log(url)
		 * ```
		 */
		declare const GenerateUrl = "__generateUrl__";
	}
	export function NavigationMixin(base: any): typeof NavigableComponent;
}
