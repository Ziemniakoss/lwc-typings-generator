import IWiredMethodsTypesGenerator from "./IWiredMethodsTypesGenerator";
import { getInnerClassesNames, parseApex } from "../../utils/apexParsingUtils";
import { ApexParser, MethodDeclarationContext } from "apex-parser";
import { promises } from "fs";
import { AURA_ENABLED_ANNOTATION_NAME } from "../../utils/constants";

export default class WiredMethodsTypesGenerator
	implements IWiredMethodsTypesGenerator
{
	async generateWiredMethodTypingsForClassContent(
		classContent: string,
		sObjectApiNames: string[]
	): Promise<string> {
		const { tokens, parser, lexer } = await parseApex(classContent);
		const wiredMethods = this.getWiredMethods(parser);
		const innerClassesNames = getInnerClassesNames(classContent);
		const className = this.getClassName(classContent);
		return wiredMethods
			.map((wiredMethod) =>
				this.gen(className, wiredMethod, sObjectApiNames, innerClassesNames)
			)
			.join("\n\n");
	}

	private gen(
		className: string,
		wiredMethod: MethodDeclarationContext,
		sObjectApiNames: string[],
		innerClassesNames: Set<string>
	): string {
		const methodName = wiredMethod.id().text;
		const moduleDeclarationHeader = `declare module "@salesforce/apex/${className}.${methodName}"{\n`;

		return moduleDeclarationHeader + "}\n";
	}

	async generateWiredMethodTypingsForFile(
		filePath: string,
		sObjectApiNames: string[]
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
			.typeDeclaration()
			.classDeclaration()
			.id().text;
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
