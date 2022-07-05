import IWiredMethodsTypingsGenerator from "./IWiredMethodsTypingsGenerator";

import { generateTsType, getQuery } from "../../utils/apexParsingUtils";

export default class WiredMethodTypingsGenerator
	implements IWiredMethodsTypingsGenerator
{
	async generateWiredMethodsTypings(
		sObjectNames:string[],
		namespace: string,
		className: string,
		parsedClass
	): Promise<string> {
		const innerClassesNames = await this.getInnerClassesNames(parsedClass);
		const r = await this.getAuraEnabledMethodsQuery();
		const x = r.matches(parsedClass.rootNode);
		let typings = "";
		for (const methodCapture of x) {
			typings += this.generateAuraEnabledMethodTypings(
				sObjectNames,
				className,
				methodCapture,
				innerClassesNames
			);
		}
		return typings;
	}
	private generateAuraEnabledMethodTypings(
		sObjectNames:string[],
		className: string,
		methodDeclarationCapture,
		innerClasses: string[]
	): string {
		let name = "";
		let paramsTypings = "";
		let methodDeclarationNode;
		for (const capture of methodDeclarationCapture.captures) {
			if (capture.name == "name") {
				name = capture.node.text;
			} else if (capture.name == "params") {
				paramsTypings = this.generateParamsTypingString(
					sObjectNames,
					className,
					capture.node,
					innerClasses
				);
			} else if (capture.name == "method_declaration") {
				methodDeclarationNode = capture.node;
			}
		}
		const returnType = generateTsType(
			className,
			methodDeclarationNode.childForFieldName("type"),
			innerClasses,
			sObjectNames
		);
		return (
			`declare module "@salesforce/apex/${className}.${name}"{\n` +
			`\texport default function ${name}(${paramsTypings}):Promise<${returnType}>;\n` +
			`}\n`
		);
	}
	private generateParamsTypingString(
		sObjectNames:string[],
		className: string,
		paramsCapture,
		innerClasses: string[]
	): string {
		const params = [];
		for (const param of paramsCapture.children) {
			if (param.type != "formal_parameter") {
				continue;
			}
			const typeTypings = generateTsType(
				className,
				param.childForFieldName("type"),
				innerClasses,
				sObjectNames
			);
			params.push(`${param.childForFieldName("name").text}?: ${typeTypings}`);
		}
		if (params.length == 0) {
			return "";
		}
		return `params: {\n\t\t${params.join(",\n\t\t")}\n\t}`;
	}

	async getAuraEnabledMethodsQuery() {
		const query = `
		(method_declaration
	(modifiers
		(annotation
			name: (identifier) @annotation
			(#match? @annotation "[aA][uU][rR][aA][eE][nN][aA][bB][lL][eE][dD]")
		)
	) @mod
    (#match? @mod "[sS][tT][Aa][tT][iI[cC]")
	name: (identifier) @name
	parameters: (formal_parameters) @params
) @method_declaration
(method_declaration
	(modifiers
		(marker_annotation
			name: (identifier) @annotation
			(#match? @annotation "[aA][uU][rR][aA][eE][nN][aA][bB][lL][eE][dD]")
		)
	) @mod
    (#match? @mod "[sS][tT][Aa][tT][iI[cC]")
	name: (identifier) @name
	parameters: (formal_parameters) @params
) @method_declaration`;
		return getQuery(query);
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
		const q = await getQuery(query);
		return q
			.matches(parsedClass.rootNode)
			.map((match) => match.captures.map((capture) => capture.node.text))
			.flat();
	}
}
