import IApexClassTypingsGenerator from "./IApexClassTypingsGenerator";
import {getQuery} from "../../utils/apexParsingUtils";

export default class ApexClassTypingsGenerator implements IApexClassTypingsGenerator{
	// @ts-ignore
	constructor(private readonly sObjectsNames:string[]) {
	}

	async generateClassTypings(namespace: string | null, className: string, parsedClass): Promise<string> {
		const innerClassesNames = await this.getInnerClassesNames(parsedClass);
		let typings = "declare namespace apex {\n"
		if(namespace != null) {
			typings = `declare namespace ${namespace} {\n`
		}
		typings += `\tdeclare interface ${className} {\n`

		typings += "\n\t}\n}\n"
		if(namespace != null) {
			typings+="}\n"
		}
		if(innerClassesNames.length > 0) {
			//todo generate for inner classes
		}
		return typings
	}


	async generateTypingsForProperties(className:string, parsedClass, innerClassesNames:string):Promise<string> {
		return ""
	}

	async generateTypingsForFields(className:string,parsedClass, innerClassesNames:string):Promise<string> {
		return ""
	}

	async getInnerClassesNames(parsedClass): Promise<string[]> {
		const query = `
		(class_declaration
			(class_body
		    	(class_declaration
		        	name: (identifier) @name
		        )
		    )
		)`;
		const q = await getQuery(query)
		return q
			.matches(parsedClass.rootNode)
			.map((match) => match.captures.map((capture) => capture.node.text))
			.flat()
	}
}
