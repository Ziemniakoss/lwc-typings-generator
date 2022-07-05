import { SfdxCommand } from "@salesforce/command";
import LabelsTypingsGenerator from "../../../LabelsTypingsGenerator";

export default class GenerateLabelsTypings extends SfdxCommand {
	protected static requiresProject = true;
	protected static requiresUsername = true;

	async run() {
		this.ux.startSpinner("Generating typings for labels");
		await new LabelsTypingsGenerator().generateForAll(
			this.org.getConnection(),
			this.project
		);
		this.ux.stopSpinner("have a great day!");
	}
}
