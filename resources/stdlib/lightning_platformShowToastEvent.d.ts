declare module "lightning/platformShowToastEvent" {
	interface ToastEventConfig {
		title: string;
		message: string;
		variant?: "success" | "info" | "warning" | "error";
		mode?: "dismissible" | "pester" | "sticky";
		messageData?: (string | { url: string; label: string })[];
	}

	export class ShowToastEvent extends CustomEvent<any> {
		constructor(config: ToastEventConfig);
	}
}
