declare module "lightning/flowSupport" {
	class FlowAttributeChangeEvent extends CustomEvent<any> {
		constructor(attributeName: string, value);
	}

	/**
	 * Requests flow to go to previous screen
	 */
	class FlowNavigationBackEvent extends CustomEvent<any> {
		constructor();
	}

	/**
	 * Requests flow to go to next screen
	 */
	class FlowNavigationNextEvent extends CustomEvent<any> {
		constructor();
	}

	/**
	 * Requests runtime to pause flow
	 */
	class FlowNavigationPauseEvent extends CustomEvent<any> {
		constructor();
	}

	/**
	 * Requests runtime to terminate flow
	 */
	class FlowNavigationFinishEvent extends CustomEvent<any> {
		constructor();
	}
}
