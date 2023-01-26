import {
	ApexLexer,
	ApexParser,
	CaseInsensitiveInputStream,
	CommonTokenStream,
	TypeNameContext,
	TypeRefContext,
} from "apex-parser";

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
	const typeSuffix =
		typeRefContext
			.arraySubscripts()
			?.LBRACK()
			?.map(() => "[]")
			?.join("") ?? "";
	const fullTypeNameLowerCase = fullTypeName.toLowerCase();
	if (sObjectNamesMap.has(fullTypeNameLowerCase)) {
		return `schema.${sObjectNamesMap.get(fullTypeNameLowerCase)}${typeSuffix}`;
	}
	if (innerClassesNames.has(fullTypeName)) {
		return `apex.${className}.${fullTypeName}${typeSuffix}`;
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
	const typeArgumentsType = typeArgument
		?.typeList()
		?.typeRef()
		?.map((typeRef) =>
			convertToTsType(typeRef, className, innerClassesNames, sObjectNamesMap)
		)
		?.join(",");
	if (typeArgumentsType == null) {
		const idCtx = typeNameCtx.id();
		if (idCtx != null) {
			return `apex.${idCtx.text}`;
		}
		return "any";
	}
	if (typeNameCtx.LIST()) {
		return typeArgumentsType + "[]";
	} else if (typeNameCtx.SET()) {
		return typeArgumentsType + "[]";
	} else if (typeNameCtx.MAP()) {
		return `Record<${typeArgumentsType}>`;
	}
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
	parser.removeErrorListeners();
	return { lexer, tokens, parser };
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
