interface Validity {
	valid: boolean;
	badInput: boolean;
	patternMismatch: boolean;
	rangeOverflow: boolean;
	rangeUnderflow: boolean;
	stepMismatch: boolean;
	tooLong: boolean;
	tooShort: boolean;
	typeMismatch: boolean;
	valueMissing: boolean;
}

declare module "lightning/input" {
	/**
	 * For full docs, see [official docs](https://developer.salesforce.com/docs/component-library/bundle/lightning-input/specification)
	 */
	export declare class Input {
		focus();
		blur();
		checkValidity();
		checkValidity(): boolean;

		/**
		 * Displays the error messages and returns false if the input is invalid.
		 * If the input is valid, reportValidity() clears displayed error messages and returns true.
		 */
		reportValidity(): boolean;
		validity: Readonly<Validity>;
		value;
		setCustomValidity(message: string);

		/**
		 * Displays error messages on invalid fields.
		 * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
		 */
		showHelpMessageIfInvalid();
	}
}
