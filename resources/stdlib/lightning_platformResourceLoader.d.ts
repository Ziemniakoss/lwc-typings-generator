declare module "lightning/platformResourceLoader" {
	/**
	 * @param {import("lwc").LightningElement} self pass this
	 * @param fileUrl url to static resource with custom javascript
	 */
	async function loadScript(self, fileUrl: string);

	/**
	 * @param {import("lwc").LightningElement} self pass this
	 * @param fileUrl url to css static resource
	 */
	async function loadStyle(self, fileUrl: string);
}
