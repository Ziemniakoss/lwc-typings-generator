declare module "lightning/formattedDateTime" {
	type Numeric = "numeric";
	type TwoDigit = "2-digit";

	export default class FormattedDateTime {
		day: TwoDigit | Numeric;
		era: "narrow" | "short" | "long";
		hour: TwoDigit | Numeric;
		/**
		 * Display as 12H clock?
		 * By default it will be calculated using user locale
		 */
		hour12?: boolean;
		minute: Numeric | TwoDigit;
		month: Numeric | TwoDigit;
		second: Numeric | TwoDigit;
		/**
		 * The time zone for date and time display. Use this attribute only if you want to override the default, which is the time zone
		 * set on the user device. Specify a time zone from the IANA time zone database (https://www.iana.org/time-zones). For example, set
		 * the value to 'Pacific/Honolulu' to display Hawaii time. The short code UTC is also accepted.
		 */
		timeZone: string; //TODO better typings
		/**
		 * Allowed values are short or long. For example, the Pacific time zone would display as 'PST'
		 * if you specify 'short', or 'Pacific Standard Time' if you specify 'long.'
		 */
		timeZoneName: string; //TODO
		value: Date | string; //TODO
		weekday: "narrow" | "short" | "long";
		year: Numeric | TwoDigit;
	}
}
