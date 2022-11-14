declare module "lightning/alert" {
	type AlertTheme = "error" | "warning" | "success" | "info";
	interface AlertConfig {
		/**
		 * Theme of Alert, error by default
		 */
		theme?: AlertTheme;
		/**
		 * Text displayed in body
		 */
		message: string;
		/**
		 * Text displayed in header
		 */
		label?: string;
	}
	type LightningAlertType = {
		open: (config: AlertConfig) => Promise<any>;
	};
	const LightningAlert: LightningAlertType;
	export default LightningAlert;
}
