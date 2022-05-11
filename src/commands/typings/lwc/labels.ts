import { SfdxCommand } from "@salesforce/command";
import { join } from "path";
import LabelsTypingsGenerator from "../../../LabelsTypingsGenerator";

export default class GenerateLabelsTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner("Generating typings for labels");
		await new LabelsTypingsGenerator().generateForAll(
			this.org.getConnection(),
			join(this.project.getPath(), ".sfdx", "lwc-typings")
		);
		this.ux.stopSpinner("have a great day!");
	}
}
