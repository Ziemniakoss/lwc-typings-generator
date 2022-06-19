declare module "lightning/formattedUrl" {
	export default class FormattedUrl {
		label: string;

		tabIndex: number;

		target: "_blank" | "_parent" | "_self" | "_top";

		tooltip: string;

		value: string;

		blur();

		click();

		focus();
	}
}
