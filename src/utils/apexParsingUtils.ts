import { join } from "path";
import { getResourcesFolder } from "./filesUtils";

const Parser = require("web-tree-sitter");

export function getApexLanguage() {
	const parserPath = join(getResourcesFolder(), "tree-sitter-apex.wasm");
	return Parser.Language.load(parserPath);
}

export async function getParser(): Promise<any> {
	await Parser.init();
	const parser = new Parser();
	parser.setLanguage(await getApexLanguage());
	return parser;
}

export async function getQuery(query: string) {
	return getApexLanguage().then((language) => language.query(query));
}

const standardTypesMap = {
	string: "apex.String",
	object: "any",
	sobject: "any",
	list: "any",
	date: "apex.Date",
	integer: "apex.Integer",
	decimal: "apex.Decimla",
	address: "apex.Address",
	double: "apex.Double",
	id: "apex.Id",
};
export function generateTsType(
	className: string,
	typeNode,
	innerClasses: string[],
	sObjectsNames: string[]
): string {
	switch (typeNode.type) {
		case "<":
		case ">":
		case ",":
			return undefined;
		case "integral_type":
			return "apex.Integer";
		case "floating_point_type":
			return "apex.Double";
		case "boolean":
			return "apex.Boolean";
		case "generic_type":
			return generateGenericTsType(
				className,
				typeNode,
				innerClasses,
				sObjectsNames
			);
		case "scoped_type_identifier":
			return `apex.${typeNode.text}`;
		case "array_type":
			return (
				generateTsType(
					className,
					typeNode.childForFieldName("element"),
					innerClasses,
					sObjectsNames
				) + "[]"
			);
	}
	if (typeNode.type == "type_identifier") {
		const id = typeNode.text;
		if (sObjectsNames.includes(id)) {
			return `schema.${id}`;
		}
		if (innerClasses.includes(id)) {
			return `apex.${className}.${id}`;
		}
		const idInLowerCase = id.toLowerCase();
		if (standardTypesMap[idInLowerCase] != null) {
			return standardTypesMap[idInLowerCase];
		}
		return `apex.${id}`;
	}
	return "any";
}

export function generateGenericTsType(
	className: string,
	genericTypeNode,
	innerClasses: string[],
	sObjectNames: string[]
): string {
	let typeIdentifier: string;
	let genericTypes = [];
	for (const child of genericTypeNode.children) {
		if (child.type == "type_identifier") {
			typeIdentifier = child.text.toString();
		} else if (child.type == "type_arguments") {
			for (const typeArgument of child.children.filter((c) => c.type != null)) {
				genericTypes.push(
					generateTsType(className, typeArgument, innerClasses, sObjectNames)
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
