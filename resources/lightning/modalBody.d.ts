type LightningElement = import("lwc").LightningElement;

declare module "lightning/modalBody" {
	/**
	 * Body of modals, example:
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
	export default class ModalBody extends LightningElement {}
}
