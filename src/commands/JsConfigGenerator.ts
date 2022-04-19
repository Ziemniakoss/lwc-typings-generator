import {relative, dirname, basename, join, sep} from "path";
import {promises} from "fs";

interface CompilerOptions {
	experimentalDecorators: boolean
	baseUrl:string
	paths:Record<string, string[]>

}
interface JsConfig {
	compilerOptions: CompilerOptions
	include:string[]
}

export default class JsConfigGenerator {
	async generateJsConfig(lwcPath:string, allLwcPaths:string[], dirWithStdlib:string) {
		const jsConfig = this.getBaseJsconfig(lwcPath, dirWithStdlib);
		for(const lwcMetadataFile of allLwcPaths) {
			if(lwcMetadataFile == lwcPath) {
				continue
			}
			const containingDir = dirname(relative(dirname(lwcPath), lwcMetadataFile))
			const componentName = basename(containingDir)
			const componentJsPath = join(containingDir, `${componentName}.js`)
			jsConfig.compilerOptions.paths[`c/${componentName}`] = [
			componentJsPath
				]
			jsConfig.include.push(componentJsPath)
		}
		return this.writeJsConfig(lwcPath, jsConfig)
	}

	getBaseJsconfig(lwcPath:string, dirWithStdLib:string) :JsConfig{
		return {
			compilerOptions: {
				experimentalDecorators: true,
				baseUrl:".",
				paths: {}
			},
			include:[
				"**.js",
				`${relative(dirname(lwcPath), dirWithStdLib)}${sep}**${sep}*.d.ts`
			]
		}
	}

	async writeJsConfig(lwcPath:string, jsConfig:JsConfig) {
		const containingDir = dirname(lwcPath)
		const path = join(containingDir, "jsconfig.json")
		return promises.writeFile(path, JSON.stringify(jsConfig, null, 4))
	}
}
