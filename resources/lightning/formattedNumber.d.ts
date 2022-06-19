declare module "lightning/formattedNumber" {
	/**
	 * More info in [official docs](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/specification)
	 */
	export declare class FormattedNumber {
		formatStyle: "decimal" | "currency" | "percent" | "percent-fixed";
		currencyDisplayAs: "symbol" | "code" | "name";
		currencyCode: string;
		maximumFractionDigits: number;
		maximumSignificantDigits: number;
		minimumFractionDigits: number;
		minimumIntegerDigits: number;
		minimumSignificantDigits: number;
		value;
	}
}
