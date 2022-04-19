import { SfdxCommand } from "@salesforce/command";
import { LWC_METADATA_FILE_EXTENSION } from "../../../utils/constants";
import { findAllFilesWithExtension } from "../../../utils/filesUtils";
import JsConfigGenerator from "../../../JsConfigGenerator";
import { join, basename } from "path";

export default class GenerateJsConfigs extends SfdxCommand {
	protected static requiresProject = true;

	async run() {
		this.ux.startSpinner("Generating jsConfigs");
		const lwcMetadataFilesPaths = await findAllFilesWithExtension(
			this.project.getPath(),
			LWC_METADATA_FILE_EXTENSION
		);
		const jsConfigGenerator = new JsConfigGenerator();
		const stdlibPath = this.getStdlibPath();
		for (const lwcMetadataFile of lwcMetadataFilesPaths) {
			this.ux.setSpinnerStatus(basename(lwcMetadataFile));

			await jsConfigGenerator.generateJsConfig(
				lwcMetadataFile,
				lwcMetadataFilesPaths,
				stdlibPath
			);
			this.ux.log(basename(lwcMetadataFile));
		}
		this.ux.stopSpinner("generated");
	}

	getStdlibPath() {
		return join(this.project.getPath(), ".sfdx", "lwc-typings");
	}
}
