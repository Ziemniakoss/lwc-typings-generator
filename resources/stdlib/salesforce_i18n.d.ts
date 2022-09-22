declare module "@salesforce/i18n/lang" {
	const I18N_LANG: string; //TODO better type
	export default I18N_LANG;
}

declare module "@salesforce/i18n/dir" {
	const I18N_DIR: "ltr" | "rtr";
	export default I18N_DIR;
}

declare module "@salesforce/i18n/locale" {
	const I18N_LOCALE: string; //TODO better type
	export default I18N_LOCALE;
}

declare module "@salesforce/i18n/currency" {
	const I18N_CURRENCY: string; //TODO better type
	export default I18N_CURRENCY;
}

declare module "@salesforce/i18n/firstDayOfWeek" {
	const I18_FIRST_DAY_OF_WEEK: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	export default I18_FIRST_DAY_OF_WEEK;
}

declare module "@salesforce/i18n/dateTime.shortDateFormat" {
	const I18N_DATE_TIME_SHORT_DATE_FORMAT: string;
	export default I18N_DATE_TIME_SHORT_DATE_FORMAT;
}

declare module "@salesforce/i18n/dateTime.mediumDateFormat" {
	const I18N_DATE_TIME_MEDIUM_DATE_FORMAT: string;
	export default I18N_DATE_TIME_MEDIUM_DATE_FORMAT;
}

declare module "@salesforce/i18n/dateTime.longDateFormat" {
	const I18N_DATE_TIME_LONG_DATE_FORMAT: string;
	export default I18N_DATE_TIME_LONG_DATE_FORMAT;
}

declare module "@salesforce/i18n/dateTime.shortDateTimeFormat" {
	const I18N_DATE_TIME_SHORT_DATE_TIME_FORMAT: string;
	export default I18N_DATE_TIME_SHORT_TIME_FORMAT;
}

declare module "@salesforce/i18n/dateTime.mediumDateTimeFormat" {
	const I18N_DATE_TIME_MEDIUM_DATE_TIME_FORMAT: string;
	export default I18N_DATE_TIME_MEDIUM_DATE_TIME_FORMAT;
}

declare module "@salesforce/i18n/dateTime.shortTimeFormat" {
	const I18N_DATE_TIME_SHORT_TIME_FORMAT: string;
	export default I18N_DATE_TIME_SHORT_TIME_FORMAT;
}

declare module "@salesforce/i18n/dateTime.longTimeFormat" {
	const I18N_DATE_TIME_LONG_TIME_FORMAT: string;
	export default I18N_DATE_TIME_LONG_TIME_FORMAT;
}

declare module "@salesforce/i18n/number.currencyFormat" {
	const I18N_NUMBER_CURRENCY_FORMAT: string;
	export default I18N_NUMBER_CURRENCY_FORMAT;
}

declare module "@salesforce/i18n/number.currencySymbol" {
	const I18N_NUMBER_CURRENCY_SYMBOL: string;
	export default I18N_NUMBER_CURRENCY_SYMBOL;
}

declare module "@salesforce/i18n/number.decimalSeparator" {
	const I18N_NUMBER_DECIMAL_SEPARATOR: string;
	export default I18N_NUMBER_DECIMAL_SEPARATOR;
}

declare module "@salesforce/i18n/number.groupingSeparator" {
	const I18N_NUMBER_GROUPING_SEPARATOR: string;
	export default I18N_NUMBER_GROUPING_SEPARATOR;
}

declare module "@salesforce/i18n/number.numberFormat" {
	const I18N_NUMBER_NUMBER_FORMAT: string;
	export default I18N_NUMBER_NUMBER_FORMAT;
}

declare module "@salesforce/i18n/number.percentFormat" {
	const I18N_NUMBER_PERCENT_FORMAT: string;
	export default I18N_NUMBER_PERCENT_FORMAT;
}

declare module "@salesforce/i18n/timeZone" {
	const I18N_TIME_ZONE: string; //TODO better type
	export default I18N_TIME_ZONE;
}
