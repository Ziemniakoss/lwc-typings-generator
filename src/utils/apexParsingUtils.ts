import { join } from "path";
import { getResourcesFolder } from "./filesUtils";
import {
	ApexLexer,
	ApexParser,
	CaseInsensitiveInputStream,
	CommonTokenStream,
	TypeNameContext,
	TypeRefContext,
} from "apex-parser";
import { promises } from "fs";

//TODO remove
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
	decimal: "apex.Decimal",
	address: "apex.Address",
	double: "apex.Double",
	id: "apex.Id",
};

/**
 * Convert Antlr type reference context to string containing typescript type
 */
export function convertToTsType(
	typeRefContext: TypeRefContext,
	className: string,
	innerClassesNames: Set<string>,
	sObjectNamesMap: Map<string, string>
): string {
	if (typeRefContext == null) {
		// This means that void was declared
		return "never";
	}

	let fullTypeName = typeRefContext
		.typeName()
		.map((typeName) => typeName.text)
		.join(".");
	const typeSuffix = fullTypeName.endsWith("[]") ? "[]" : "";
	const fullTypeNameLowerCase = fullTypeName.toLowerCase();
	if (sObjectNamesMap.has(fullTypeNameLowerCase)) {
		return `schema.${sObjectNamesMap.get(fullTypeNameLowerCase)}${typeSuffix}`;
	}
	if (innerClassesNames.has(fullTypeName)) {
		return `apex.${className}.${fullTypeName}`;
	}
	const typeNames = typeRefContext.typeName();
	if (typeNames.length == 1) {
		if (standardTypesMap[fullTypeNameLowerCase]) {
			return `${standardTypesMap[fullTypeNameLowerCase]}${typeSuffix}`;
		}

		return (
			convertTypeNameToTsType(
				typeRefContext.typeName()[0],
				className,
				innerClassesNames,
				sObjectNamesMap
			) + typeSuffix
		);
	}
	return `apex.${fullTypeName}${typeSuffix}`;
}

//@ts-ignore
function convertTypeNameToTsType(
	typeNameCtx: TypeNameContext,
	className: string,
	innerClassesNames: Set<string>,
	sObjectNamesMap: Map<string, string>
): string {
	const typeArgument = typeNameCtx.typeArguments();
	const typeArgumentsType =
		typeArgument
			.typeList()
			?.typeRef()
			?.map((typeRef) =>
				convertToTsType(typeRef, className, innerClassesNames, sObjectNamesMap)
			)
			?.join(",") ?? "any";
	if (typeNameCtx.LIST()) {
		return typeArgumentsType + "[]";
	} else if (typeNameCtx.SET()) {
		return typeArgumentsType + "[]";
	} else if (typeNameCtx.MAP()) {
		return `Record<${typeArgumentsType}>`;
	}
}

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

//TODO delete
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
			typeIdentifier = child.text.toString().toLowerCase();
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

type ParseApexReturnType = {
	lexer: ApexLexer;
	tokens: CommonTokenStream;
	parser: ApexParser;
};

/**
 * Parse apex using antlr grammar
 *
 * @param apexContent content of apex class
 */
export function parseApex(apexContent: string): ParseApexReturnType {
	let lexer = new ApexLexer(new CaseInsensitiveInputStream(null, apexContent));
	let tokens = new CommonTokenStream(lexer);

	let parser = new ApexParser(tokens);
	return { lexer, tokens, parser };
}

/**
 * Parse apex class defined in specified file
 *
 * @param path path to apex class
 */
export async function parseApexFromFile(
	path: string
): Promise<ReturnType<typeof parseApex>> {
	return promises.readFile(path, "utf-8").then(parseApex);
}

export function getInnerClassesNames(apexClassContent: string): Set<string> {
	const innerClassesNames =
		parseApex(apexClassContent)
			.parser.compilationUnit()
			?.typeDeclaration()
			?.classDeclaration()
			?.classBody()
			?.classBodyDeclaration()
			?.map((a) => a.memberDeclaration()?.classDeclaration()?.id())
			?.filter((classDeclarationContext) => classDeclarationContext)
			?.map((innerClassContext) => innerClassContext.text) ?? [];
	return new Set(innerClassesNames);
}
