declare module "lightning/platformShowToastEvent" {
	interface ToastEventConfig {
		title: string;
		message: string;
		variant?: "success" | "info" | "warning" | "error";
		mode?: "dismissible" | "pester" | "sticky";
	}

	export class ShowToastEvent extends CustomEvent {
		constructor(config: ToastEventConfig);
	}
}
