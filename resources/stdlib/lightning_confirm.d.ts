declare module "lightning/confirm" {
	type ConfirmationVariant = "headerless";
	type ConfirmationTheme = "default" | "error" | "warning" | "info";

	interface LightningConfirmationConfig {
		message: string;
		/**
		 * Can be header less or with header if no value is provided
		 */
		variant?: ConfirmationVariant;
		theme?: ConfirmationTheme;
		/**
		 * Displayed in header (in variant with header)
		 */
		label: string;
	}

	interface LightningConfirmationType {
		open: (config: LightningConfirmationConfig) => Promise<boolean>;
	}

	const LightningConfirm: LightningConfirmationType;
	export default LightningConfirm;
}
