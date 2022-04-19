import { SfdxCommand } from "@salesforce/command";
import { promises, existsSync } from "fs";
import { join } from "path";

export default class GenerateLabelsTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner("Generating typings for labels");
		this.ux.setSpinnerStatus("listing labels");
		const labelsFullNames = await this.org
			.getConnection()
			.metadata.list({ type: "CustomLabel" })
			.then((labelsMetadata) =>
				labelsMetadata.map((labelMetadata) => labelMetadata.fullName)
			);
		let typings = "";
		for (const fullName of labelsFullNames) {
			this.ux.setSpinnerStatus(fullName);
			const labelMetadata = await this.org
				.getConnection()
				.metadata.read("CustomLabel", fullName);
			typings += this.generateTypingsForLabelMetadata(labelMetadata);
		}
		this.ux.setSpinnerStatus("Writing to file");
		const typingsDir = join(this.project.getPath(), ".sfdx", "lwc-typings");
		if (!existsSync(typingsDir)) {
			await promises.mkdir(typingsDir);
		}
		const outputPath = join(typingsDir, "labels.d.ts");
		await promises.writeFile(outputPath, typings);

		this.ux.stopSpinner("have a great day!");
	}

	generateTypingsForLabelMetadata(labelMetadata): string {
		let fullName = labelMetadata.fullName;
		let namespace = "c";
		const splitedLabel = labelMetadata.fullName.split("__");
		if (splitedLabel.length > 1) {
			fullName = splitedLabel[1];
			namespace = splitedLabel[0];
		}
		const categories = labelMetadata.categories?.split(",") ?? [];
		const docsString =
			"/**\n" +
			`# ${labelMetadata.fullName}\n\n` +
			labelMetadata.shortDescription +
			"\n" +
			"## Categories\n" +
			categories.map((c) => `- ${c}`).join("\n") +
			"\n*/\n";
		return (
			`declare module "@salesforce/label/${namespace}.${fullName}" {\n` +
			docsString +
			`\tconst ${fullName}:string\n` +
			`\texport default ${fullName}\n` +
			"}\n"
		);
	}
}
