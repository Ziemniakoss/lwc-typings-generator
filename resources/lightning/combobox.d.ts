declare module "lightning/combobox" {
	export default class Combobox {
		blur();

		focus();

		checkValidity(): boolean;
		setCustomValidity(message: string);
		reportValidity(): boolean;
	}
}
