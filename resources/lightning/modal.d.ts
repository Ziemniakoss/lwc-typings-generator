// type LightningElement = import("lwc").LightningElement;

declare module "lightning/modal" {
	/**
	 * Base for all modals. Example
	 * ```html
	 * <template>
	 *     <lightning-modal-header
	 *         label="My Modal Heading"
	 *      >
	 *     </lightning-modal-header>
	 *     <lightning-modal-body>
	 *         Content: {content}
	 *     </lightning-modal-body>
	 *     <lightning-modal-footer>
	 *         <lightning-button label="OK" onclick={handleOkay}></lightning-button>
	 *     </lightning-modal-footer>
	 * </template>
	 * ```
	 */
	export default class Modal {
		//extends LightningElement {
		/**
		 * Accessible description
		 */
		description?: string;
		/**
		 * Prevents closing the modal by:
		 * - calling close()
		 * - pressing escape
		 * - close button
		 */
		disableClose?: boolean;
		/**
		 * Modal title and assitive device label
		 */
		label: string;
		/**
		 * How big modal should be
		 */
		size: ModalSize;

		close(result: any);

		/**
		 * @param config
		 * @return promise with:
		 * - undefined if modal was closed with X button
		 * - {T} when closed with ok button
		 */
		static open(config: OpenModalConfig): Promise<any>;
	}
}

interface NoEventsOpenModalConfig {
	label: string;
	size?: ModalSize;
	description?: string;
	disableClose?: boolean;
}

type OpenModalConfig = NoEventsOpenModalConfig &
	Record<string, (event: CustomEvent) => any>;

type ModalSize = "small" | "medium" | "large";
