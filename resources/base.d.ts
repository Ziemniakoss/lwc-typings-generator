type LightningInput = import("lightning/input").default;
type LightningCombobox = import("lightning/combobox").default;
type LightningDatatable = import("lightning/datatable").default;
// customImportsHere
declare module "lwc" {
	interface Template {
		readonly activeElement: Element | null;
		readonly delegatesFocus: boolean;

		// customQuerySelectorsHere

		querySelector(query: "lightning-input"): LightningInput | null;

		querySelector(query: "lightning-combobox"): LightningCombobox | null;

		querySelector(query: "lightning-datatable"): LightningDatatable | null;

		querySelector(query: string): LightningElement | null;

		// customQuerySelectorAllHere

		querySelectorAll(query: "lightning-input"): LightningInput[];

		querySelectorAll(query: "lightning-combobox"): LightningCombobox[];

		querySelectorAll(query: "lightning-datatable"): LightningDatatable[];

		querySelectorAll(query: string): LightningElement[];
	}

	/**
	 * Base class for the Lightning Web Component JavaScript class
	 */
	export class LightningElement {
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

	/**
	 * Decorator to mark public reactive properties
	 */
	export const api: PropertyDecorator;

	/**
	 * Decorator to mark private reactive properties
	 */
	export const track: PropertyDecorator;

	export function wire(
		getType: (params?: T) => any,
		config?: T
	): PropertyDecorator;
}
