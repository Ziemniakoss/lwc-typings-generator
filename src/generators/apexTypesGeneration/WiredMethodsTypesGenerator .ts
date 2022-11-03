import IWiredMethodsTypesGenerator from "./IWiredMethodsTypesGenerator";
import {
	convertToTsType,
	getInnerClassesNames,
	parseApex,
} from "../../utils/apexParsingUtils";
import {
	ApexParser,
	FormalParameterContext,
	MethodDeclarationContext,
} from "apex-parser";
import { promises } from "fs";
import {
	AURA_ENABLED_ANNOTATION_NAME,
	GENERATED_WITH_PLUGIN_TEXT,
} from "../../utils/constants";

export default class WiredMethodsTypesGenerator
	implements IWiredMethodsTypesGenerator
{
	async generateWiredMethodTypingsForClassContent(
		classContent: string,
		sObjectApiNames: Map<string, string>
	): Promise<string> {
		const { parser } = await parseApex(classContent);
		const className = this.getClassName(classContent);
		if (className == null) {
			return "";
		}
		const wiredMethods = this.getWiredMethods(parser);
		const innerClassesNames = getInnerClassesNames(classContent);
		return wiredMethods
			.map((wiredMethod) =>
				this.gen(className, wiredMethod, sObjectApiNames, innerClassesNames)
			)
			.join("\n\n");
	}

	private getWiredMethodDocumentation(
		className: string,
		wiredMethodCtx: MethodDeclarationContext
	): string {
		return `\n\t/**\n\t * ${GENERATED_WITH_PLUGIN_TEXT} \n\t */\n`;
	}

	private gen(
		className: string,
		wiredMethod: MethodDeclarationContext,
		sObjectApiNames: Map<string, string>,
		innerClassesNames: Set<string>
	): string {
		const methodName = wiredMethod.id().text;
		const returnType = `Promise<${convertToTsType(
			wiredMethod.typeRef(),
			className,
			innerClassesNames,
			sObjectApiNames
		)}>`;
		const moduleDeclarationHeader = `declare module "@salesforce/apex/${className}.${methodName}"{\n`;
		wiredMethod.formalParameters().formalParameterList().formalParameter();
		const functionDocs = this.getWiredMethodDocumentation(
			className,
			wiredMethod
		);
		const parametersTypings = this.generateTypingsForParameters(
			wiredMethod.formalParameters()?.formalParameterList()?.formalParameter(),
			className,
			innerClassesNames,
			sObjectApiNames
		);
		const functionDeclaration = `\texport default function ${methodName}(${parametersTypings}):${returnType};\n`;
		return moduleDeclarationHeader + functionDocs + functionDeclaration + "}\n";
	}

	private generateTypingsForParameters(
		parameters: FormalParameterContext[],
		className: string,
		innerClassesNames: Set<string>,
		sObjectApiNames: Map<string, string>
	): string {
		if (parameters == null || parameters.length == 0) {
			return "";
		}
		const parameterTypings = parameters
			.map(
				(parameter) =>
					`\t\t${parameter.id().text}?: ${convertToTsType(
						parameter.typeRef(),
						className,
						innerClassesNames,
						sObjectApiNames
					)}`
			)
			.join(",\n");
		return `config:{\n${parameterTypings}\n\t}`;
	}

	async generateWiredMethodTypingsForFile(
		filePath: string,
		sObjectApiNames: Map<string, string>
	): Promise<string> {
		const classContent = await promises.readFile(filePath, "utf-8");
		return this.generateWiredMethodTypingsForClassContent(
			classContent,
			sObjectApiNames
		);
	}

	private getClassName(classContent: string): string {
		return parseApex(classContent)
			.parser.compilationUnit()
			?.typeDeclaration()
			?.classDeclaration()
			?.id()?.text;
	}

	private getWiredMethods(parser: ApexParser) {
		parser.reset();
		return parser
			.compilationUnit()
			?.typeDeclaration()
			?.classDeclaration()
			?.classBody()
			?.classBodyDeclaration()
			?.filter((classBodyDeclarationCtx) => {
				const annotations = classBodyDeclarationCtx
					.modifier()
					.map((modifier) => modifier.annotation())
					.filter(
						(annotation) =>
							annotation?.qualifiedName()?.text?.toLowerCase() ==
							AURA_ENABLED_ANNOTATION_NAME
					);
				return annotations.length > 0;
			})
			?.map((a) => a.memberDeclaration()?.methodDeclaration())
			?.filter((a) => a);
	}
}
