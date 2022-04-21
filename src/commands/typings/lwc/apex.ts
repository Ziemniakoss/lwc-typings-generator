import { SfdxCommand } from "@salesforce/command";
import { ApexTypingsGenerator } from "../../../ApexTypingsGenerator";
import { basename, join } from "path";
import { findAllFilesWithExtension} from "../../../utils/filesUtils";

export default class GenerateApexTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner(
			"Generating typings for apex classes",
			"fetching sobject names"
		);
		const sObjectNames = await this.org
			.getConnection()
			.metadata.list({ type: "CustomObject" })
			.then((metadata) => metadata.map((m) => m.fullName.toLowerCase()));
		const typignsPath = join(this.project.getPath(), ".sfdx", "lwc-typings");
		const generator = new ApexTypingsGenerator(
			sObjectNames,
			this.org.getConnection()
		);
		const apexClassesOrPaths = await findAllFilesWithExtension(this.project.getPath(), ".cls")
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
}
