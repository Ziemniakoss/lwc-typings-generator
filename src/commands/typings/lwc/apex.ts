import { flags, SfdxCommand } from "@salesforce/command";
import { ApexTypingsGenerator } from "../../../ApexTypingsGenerator";
import { basename, join } from "path";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;
	public static flagsConfig = {
		classes: flags.string({
			char: "c",
			description:
				"[NOT SUPPORTED YET] Comma separated classes with aura wired mehds",
			hidden: true,
		}),
		paths: flags.string({
			char: "p",
			required: true,
			description: "Paths with classes to generate typings for",
		}),
	};

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		// const sObjectNames = await this.org
		// 	.getConnection()
		// 	.metadata
		// 	.list({type: "CustomObject"})
		// 	.then(metadata => metadata.map(m => m.fullName))
		const typignsPath = join(this.project.getPath(), ".sfdx", "lwc-typings");
		const generator = new ApexTypingsGenerator(
			/*sObjectNames*/ [],
			this.org.getConnection()
		);
		const apexClassesOrPaths = await this.getClassesOrPathsNames();
		for (const classOrPath of apexClassesOrPaths) {
			let status = classOrPath.endsWith(".cls")
				? basename(classOrPath)
				: classOrPath;
			this.ux.setSpinnerStatus(`generating for ${status}`);
			await generator.generateTypings(classOrPath, typignsPath);
			this.ux.log(classOrPath);
		}
		this.ux.stopSpinner("have fun!");
	}

	async getClassesOrPathsNames(): Promise<string[]> {
		if (this.flags.paths != null) {
			return this.flags.paths.split(",").map((dirtyPath) => dirtyPath.trim());
		}
		if (this.flags.classes != null) {
			return this.flags.classes.split(",").map((className) => className.trim());
		}
		this.ux.setSpinnerStatus("fetching apex classes names");
		return this.org
			.getConnection()
			.metadata.list({ type: "ApexClass" })
			.then((m) => m.map((apexClass) => apexClass.fullName));
	}
}
