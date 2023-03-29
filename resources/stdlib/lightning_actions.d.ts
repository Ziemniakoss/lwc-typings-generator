/**
 * [Full docs](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_quick_actions_screen)
 */
declare module "lightning/actions" {
	/**
	 * Closes action represented by current component
	 */
	export class CloseActionScreenEvent<never> extends CustomEvent {
		constructor();
	}
}
