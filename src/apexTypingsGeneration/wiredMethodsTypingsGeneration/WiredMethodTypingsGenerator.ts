import IWiredMethodsTypingsGenerator from "./IWiredMethodsTypingsGenerator";

import {getQuery} from "../../utils/apexParsingUtils";
const standardTypesMap = {
	string: "string",
	object: "any",
	sobject: "any",
	list: "any",
	date: "string | Date",
	id: "string",
};
export default class WiredMethodTypingsGenerator implements IWiredMethodsTypingsGenerator {
	constructor(private readonly sObjectsNames:string[]) {
	}

	async generateWiredMethodsTypings(namespace: string, className: string, parsedClass) :Promise<string>{
		const innerClassesNames = await this.getInnerClassesNames(parsedClass);
		const r = await this.getAuraEnabledMethodsQuery();
		const x = r.matches(parsedClass.rootNode);
		let typings = "";
		for (const methodCapture of x) {
			typings += this.generateAuraEnabledMethodTypings(
				className,
				methodCapture,
				innerClassesNames
			);
		}
		return typings
	}
	private generateAuraEnabledMethodTypings(
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
					className,
					capture.node,
					innerClasses
				);
			} else if (capture.name == "method_declaration") {
				methodDeclarationNode = capture.node;
			}
		}
		const returnType = this.generateTsType(
			className,
			methodDeclarationNode.childForFieldName("type"),
			innerClasses
		);
		return (
			`declare module "@salesforce/apex/${className}.${name}"{\n` +
			`\texport default function ${name}(${paramsTypings}):Promise<${returnType}>;\n` +
			`}\n`
		);
	}
	private generateParamsTypingString(
		className: string,
		paramsCapture,
		innerClasses: string[]
	): string {
		const params = [];
		for (const param of paramsCapture.children) {
			if (param.type != "formal_parameter") {
				continue;
			}
			const typeTypings = this.generateTsType(
				className,
				param.childForFieldName("type"),
				innerClasses
			);
			params.push(`${param.childForFieldName("name").text}?: ${typeTypings}`);
		}
		if (params.length == 0) {
			return "";
		}
		return `params: {\n\t\t${params.join(",\n\t\t")}\n\t}`;
	}

	generateTsType(className: string, typeNode, innerClasses: string[]): string {
		switch (typeNode.type) {
			case "<":
			case ">":
			case ",":
				return undefined;
			case "integral_type":
			case "floating_point_type":
				return "number";
			case "boolean":
				return "boolean";
			case "generic_type":
				return this.generateGenericTsType(className, typeNode, innerClasses);
			case "scoped_type_identifier":
				return `apex.${typeNode.text}`
			case "array_type":
				return (
					this.generateTsType(
						className,
						typeNode.childForFieldName("element"),
						innerClasses
					) + "[]"
				);
		}
		if (typeNode.type == "type_identifier") {
			const id = typeNode.text;
			if (this.sObjectsNames.includes(id)) {
				return `schema.${id}`;
			}
			if (innerClasses.includes(id)) {
				return `apex.${className}.${id}`;
			}
			if (standardTypesMap[id] != null) {
				return standardTypesMap[id];
			}
			return `apex.${id}`;
		}
		return "any";
	}

	generateGenericTsType(
		className: string,
		genericTypeNode,
		innerClasses: string[]
	): string {
		let typeIdentifier: string;
		let genericTypes = [];
		for (const child of genericTypeNode.children) {
			if (child.type == "type_identifier") {
				typeIdentifier = child.text.toString().toLowerCase();
			} else if (child.type == "type_arguments") {
				for (const typeArgument of child.children.filter(
					(c) => c.type != null
				)) {
					genericTypes.push(
						this.generateTsType(className, typeArgument, innerClasses)
					);
				}
			}
		}
		genericTypes = genericTypes.filter((type) => type != null);
		if (typeIdentifier == "map") {
			return `Record<${genericTypes.join(",")}>`;
		} else if (typeIdentifier == "set" || typeIdentifier == "list") {
			return `${genericTypes.join(",")}[]`;
		}
		return "any";
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
		return getQuery(query)
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
			.map((name) => name.toLowerCase());
	}
}
