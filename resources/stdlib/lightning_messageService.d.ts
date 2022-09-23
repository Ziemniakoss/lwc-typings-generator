declare module "lightning/messageService" {
	export const APPLICATION_SCOPE :any

	/**
	 * Call this function in components that don't extend LightingElement (they can't use @wire(MessageContext)).
	 */
	export function createMessageContext() : typeof MessageContext

	export const MessageContext:any

	export function publish()

	export function releaseMessageContext();

	export function subscribe();

	export function unsubscribe();

}
