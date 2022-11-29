/**
 * Lightning Message Service
 *
 * [Full docs](https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation)
 *
 * Examples in recipies:
 * - [subscriber demo](https://github.com/trailheadapps/lwc-recipes/tree/main/force-app/main/default/lwc/lmsSubscriberWebComponent)
 * - [publishing demo](https://github.com/trailheadapps/lwc-recipes/tree/main/force-app/main/default/lwc/lmsPublisherWebComponent)
 */
declare module "lightning/messageService" {
	export const APPLICATION_SCOPE: any;

	/**
	 * Call this function in components that don't extend LightingElement (they can't use @wire(MessageContext)).
	 */
	export function createMessageContext(): typeof MessageContext;

	export const MessageContext: symbol;

	/**
	 * Publishes a message to a specified message channel.
	 *
	 * @param messageContext The MessageContext object provides information about the Lightning web component that is using the Lightning message service.
	 * Get this object via the MessageContext wire adapter or via createMessageContext().
	 * @param messageChannel The message channel object.
	 * To import a message channel, use the scoped module `@salesforce/messageChannel`.
	 * To create a message channel in an org, use the LightningMessageChannel metadata type.
	 * @param message A serializable JSON object containing the message published to subscribers.
	 * A message can't contain functions or symbols.
	 */
	export function publish(messageContext, messageChannel, message);

	export function releaseMessageContext(messageContext);

	/**
	 * Subscribes to a specified message channel. Returns a Subscription object that you can use to unsubscribe.
	 *
	 * By default, communication over a message channel can occur only between Lightning web components, Aura components, or Visualforce pages in an active navigation tab, an active navigation item, or a utility item.
	 * Utility items are always active.
	 * A navigation tab or item is active when it’s selected.
	 * Navigation tabs and items include:
	 * - Standard navigation tabs
	 * - Console navigation workspace tabs
	 * - Console navigation subtabs
	 * - Console navigation items
	 *
	 * To receive messages on a message channel from anywhere in the application, pass the subscriberOptions parameter as `{scope: APPLICATION_SCOPE}`.
	 * Import `APPLICATION_SCOPE` from `lightning/messageService`.
	 *
	 * @param messageContext The MessageContext object provides information about the Lightning web component that is using the Lightning message service.
	 * @param messageChannel To import a message channel, use the scoped module @salesforce/messageChannel.
	 * To create a message channel in an org, use the LightningMessageChannel metadata type.
	 * @param listener A function that handles the message once it is published.
	 * @param subscriberOptions (Optional) An object that, when set to {scope: APPLICATION_SCOPE}, specifies the ability to receive messages on a message channel from anywhere in the application.
	 * Import APPLICATION_SCOPE from lightning/messageService.
	 */
	export function subscribe(
		messageContext,
		messageChannel,
		listener,
		subscriberOptions?
	);

	export function unsubscribe(subscription);
}
