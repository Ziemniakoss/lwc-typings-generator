import { SfdxCommand } from "@salesforce/command";
import { getGeneratorConfigFile, mkdirs } from "../../../../utils/filesUtils";
import { existsSync, promises } from "fs";
import { dirname } from "path";

export default class CreateConfigCommand extends SfdxCommand {
	public static description = "Create example config file";
	protected static requiresProject = true;

	async run() {
		const configPath = getGeneratorConfigFile(this.project);
		if (existsSync(configPath)) {
			const consent = await this.ux.confirm(
				"Config file already exists. Do you want to override it?"
			);
			if (!consent) {
				return;
			}
		}

		this.ux.startSpinner("creating config");
		const defaultConfig = {
			common: [["dir", "with", "typings", "for", "all", "components"]],
			componentSpecific: {
				"c/yourComponentName": [
					["your", "custom", "typings", "dir", "only for", "this", "component"],
				],
			},
			typingsPath: [".sfdx", "lwc-typings"],
		};
		await mkdirs(dirname(configPath));
		await promises.writeFile(
			configPath,
			JSON.stringify(defaultConfig, null, 4)
		);
		this.ux.stopSpinner("created");
		this.ux.log(`Your config file is generated in file ${configPath}`);
		return {
			filePath: configPath,
			content: defaultConfig,
		};
	}
}
