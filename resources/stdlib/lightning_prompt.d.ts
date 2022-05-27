declare module "lightning/prompt" {
	type PromptTheme = "default" | "error" | "warning" | "info";
	interface LightningPromptConfig {
		message: string;
		label: string;
		theme?: PromptTheme;
		defaultValue?: string;
	}
	interface LightningPromptType {
		/**
		 *
		 * @param config
		 * @return null if user clicked cancel
		 */
		open: (config: LightningPromptConfig) => Promise<string | null>;
	}
	const LightningPrompt: LightningPromptType;
	export default LightningPrompt;
}
