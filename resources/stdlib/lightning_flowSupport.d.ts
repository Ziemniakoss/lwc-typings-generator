declare module "lightning/flowSupport" {
	class FlowAttributeChangeEvent extends CustomEvent {
		constructor(attributeName: string, value);
	}

	/**
	 * Requests flow to go to previous screen
	 */
	class FlowNavigationBackEvent extends CustomEvent {}

	/**
	 * Requests flow to go to next screen
	 */
	class FlowNavigationNextEvent extends CustomEvent {}

	/**
	 * Requests runtime to pause flow
	 */
	class FlowNavigationPauseEvent extends CustomEvent {}

	/**
	 * Requests runtime to terminate flow
	 */
	class FlowNavigationFinishEvent extends CustomEvent {}
}
