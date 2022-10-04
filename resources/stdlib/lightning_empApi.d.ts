type Subscription = any;

/**
 * [Official documentation](https://docs.cometd.org/current3/reference/#_bayeux_meta_unsubscribe)
 */
interface UnsubscribeResponse {
	error?: string;
	clientId: string;
	successful: boolean;
	channel: string;
}

declare module "lightning/empApi" {
	/**
	 * @param channelName
	 * @param replayId Indicates what point in the stream to replay events from.
	 * Specify -1 to get new events from the tip of the stream, -2 to replay from the last saved event, or a specific event replay ID to get all saved and new events after that ID.
	 * @param onMessageCallback called for each message
	 */
	export function subscribe(
		channelName: string,
		replayId: -1 | -2 | any,
		onMessageCallback: (response: any) => any
	): Promise<Subscription>;

	/**
	 * @param subscription
	 * @param unsubscribedCallback called when server processes request.
	 * Response is based on [CometD protocol](https://docs.cometd.org/current3/reference/#_bayeux_meta_unsubscribe)
	 */
	export function unsubscribe(
		subscription: Subscription,
		unsubscribedCallback: (response: UnsubscribeResponse) => any
	): Promise<any>;

	/**
	 * Called on:
	 * - handshake
	 * - connection
	 * - subscription
	 * - unsubscribing
	 *
	 *  goes wrong
	 * @param callback method called on error
	 */
	export function onError(callback);

	/**
	 * Enable/disable console debugging
	 * @param flag
	 */
	export function setDebugFlag(flag: boolean);

	/**
	 * Checks jf EmpJs Streaming API is enabled in given contexf
	 */
	export function isEmpEnabled(): Promise<boolean>;
}
