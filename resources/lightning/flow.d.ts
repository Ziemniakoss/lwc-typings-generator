/**
 * [Docs](https://developer.salesforce.com/docs/component-library/bundle/lightning-flow/specification)
 */
declare module "lightning/flow" {
	/**
	 * [Docs](https://developer.salesforce.com/docs/component-library/bundle/lightning-flow/specification)
	 */
	export default class LightningFlowComponent {
		flowApiName: string; //TODO better type

		/**
		 * Sets the behavior when the flow completes.
		 * Valid values are NONE and RESTART.
		 * Default is RESTART.
		 * Not required.
		 */
		flowFinishBehavior: "RESTART" | "NONE";

		flowInputVariables;

		flowInterviewId;

		resumeFlow(flowInterviewId);

		startFlow(
			flowApiName: LightningFlowComponent["flowApiName"],
			flowInputVariables: LightningFlowComponent["flowInputVariables"]
		);
	}
}
