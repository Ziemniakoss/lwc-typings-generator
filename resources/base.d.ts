interface Template {
	readonly activeElement: Element | null;

	readonly delegatesFocus: boolean;

	addEventListener(type: string, listener: Function, options);

	removeEventListener(type: string, listener: Function, options);

	querySelector<Query extends keyof LwcElementTadNameMap>(
		query: Query
	): LwcElementTadNameMap[Query] | null;

	querySelector(query: string): any | null;

	querySelectorAll<Query extends keyof LwcElementTadNameMap>(
		query: Query
	): LwcElementTadNameMap[Query][];

	querySelectorAll(query: string): any[];
}

class LwcComponentBase {
	dispatchEvent(evt: CustomEvent): boolean;

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

class NavigableComponent extends LwcComponentBase {
	/**
	 * Don't use directly.
	 * Use only for reference
	 * ```js
	 *	this[NavigationMixin.GenerateUrl](pageReference)
	 *		.then(url => this.url = url);
	 * ```
	 */
	__navigate__(pageRef: lightning.navigation.PageReference, replace?: boolean);
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
		pageReference: lightning.navigation.PageReference
	): Promise<string>;
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

	/***
	 * Use with @wire to get current page reference
	 *
	 * ```js
	 * @wire(CurrentPageReference)
	 * setCurrentPageReference(currentPageReference) {
	 *      this.currentPageReference = currentPageReference;
	 * 	    this.checkForStuffToBeLoaded();
	 * }
	 * ```
	 */
	export function CurrentPageReference(): Parameters<
		NavigableComponent["__navigate__"]
	>[0];
}
