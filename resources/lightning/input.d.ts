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
	export default class Input {
		label: string;
		checked: boolean;
		value: any;
		/**
		 * Search type only
		 */
		isLoading: boolean;
		required: boolean;
		readOnly: boolean;
		type:
			| "checkbox"
			| "checkbox-button"
			| "color"
			| "date"
			| "datetime"
			| "time"
			| "email"
			| "file"
			| "password"
			| "range"
			| "search"
			| "tel"
			| "url"
			| "number"
			| "toggle";
		variant: "label-hidden" | "label-inline" | "label-stacked";

		focus();

		blur();

		/**
		 * Displays the error messages and returns false if the input is invalid.
		 * If the input is valid, reportValidity() clears displayed error messages and returns true.
		 */
		checkValidity(): boolean;

		/**
		 * Displays the error messages and returns false if the input is invalid.
		 * If the input is valid, reportValidity() clears displayed error messages and returns true.
		 */
		reportValidity(): boolean;

		validity: Readonly<Validity>;

		setCustomValidity(message: string);

		/**
		 * Displays error messages on invalid fields.
		 * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
		 */
		showHelpMessageIfInvalid();
	}
}
