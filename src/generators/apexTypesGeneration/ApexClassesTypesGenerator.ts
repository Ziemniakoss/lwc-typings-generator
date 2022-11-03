import IApexClassesTypesGenerator from "./IApexClassesTypesGenerator";
import { convertToTsType, parseApex } from "../../utils/apexParsingUtils";
import {
	ClassBodyContext,
	ClassDeclarationContext,
	FieldDeclarationContext,
	PropertyDeclarationContext,
} from "apex-parser";
import { promises } from "fs";
import { AURA_ENABLED_ANNOTATION_NAME } from "../../utils/constants";

export default class ApexClassesTypesGenerator
	implements IApexClassesTypesGenerator
{
	generateTypings(
		classContent: string,
		sObjectApiNamesMap: Map<string, string>,
		namespace?: string
	): string {
		const { parser } = parseApex(classContent);
		const classBody = parser
			?.compilationUnit()
			?.typeDeclaration()
			?.classDeclaration();
		if (classBody == null) {
			return "";
		}
		return this.generateTypingsForClass(
			classBody,
			sObjectApiNamesMap,
			namespace,
			null
		);
	}

	private generateTypingsForClass(
		classBodyCtx: ClassDeclarationContext,
		sObjectApiNamesMap: Map<string, string>,
		namespace?: string,
		outerClassName?: string,
		innerClassesNames?: Set<string>
	): string {
		const auraEnabledMembers = this.getAuraEnabledMembers(
			classBodyCtx.classBody()
		);
		const innerClassesCtxs = this.getInnerClasses(classBodyCtx.classBody());
		if (innerClassesNames == null) {
			innerClassesNames = new Set<string>(
				innerClassesCtxs.map((ctx) => ctx.id().text)
			);
		}

		const className = classBodyCtx.id().text;
		const membersTypings = auraEnabledMembers
			.map((member) => {
				if (member instanceof PropertyDeclarationContext) {
					return this.generateTypingsForProperty(
						member,
						className,
						innerClassesNames,
						sObjectApiNamesMap
					);
				} else {
					return this.generateTypingsForField(
						member,
						className,
						innerClassesNames,
						sObjectApiNamesMap
					);
				}
			})
			.join("\n");
		let namespaceDeclaration = "declare namespace apex";
		if (namespace) {
			namespaceDeclaration += `.${namespace}`;
		}
		if (outerClassName) {
			namespaceDeclaration += `.${outerClassName}`;
		}
		const classTypings = `${namespaceDeclaration}{\n\tdeclare interface ${className}{\n${membersTypings}\n\t}\n}\n`;

		const innerClassesTypings = innerClassesCtxs.map((ctx) =>
			this.generateTypingsForClass(
				ctx,
				sObjectApiNamesMap,
				namespace,
				className,
				innerClassesNames
			)
		);
		return classTypings + innerClassesTypings;
	}

	private generateTypingsForProperty(
		propertyCtx: PropertyDeclarationContext,
		className: string,
		innerClassesNames: Set<string>,
		sObjectApiNamesMap: Map<string, string>
	): string {
		return `\t\t${
			propertyCtx?.id().text ?? "unknownPropertyReportBug"
		}?: ${convertToTsType(
			propertyCtx.typeRef(),
			className,
			innerClassesNames,
			sObjectApiNamesMap
		)}`;
	}

	private generateTypingsForField(
		fieldCtx: FieldDeclarationContext,
		className: string,
		innerClassesNames: Set<string>,
		sObjectApiNamesMap: Map<string, string>
	): string {
		const tsType = convertToTsType(
			fieldCtx.typeRef(),
			className,
			innerClassesNames,
			sObjectApiNamesMap
		);
		return fieldCtx
			.variableDeclarators()
			.variableDeclarator()
			.map((variableCtx) => `\t\t${variableCtx.id().text}?: ${tsType}`)
			.join("\n");
	}

	private getInnerClasses(classBody: ClassBodyContext) {
		return classBody
			.classBodyDeclaration()
			.map((classBodyDeclarationCtx) =>
				classBodyDeclarationCtx.memberDeclaration()?.classDeclaration()
			)
			.filter((ctx) => ctx);
	}

	/**
	 * Finds mebers of class that are either fields or property and are annotated with @AuraEnabled annotation
	 */
	private getAuraEnabledMembers(classBody: ClassBodyContext) {
		return (
			classBody
				.classBodyDeclaration()
				.filter((classBodyDeclaration) => {
					return (
						classBodyDeclaration
							.modifier()
							?.map((modifier) =>
								modifier.annotation()?.qualifiedName().text.toLowerCase()
							)
							?.find(
								(annotationName) =>
									annotationName?.toLowerCase() == AURA_ENABLED_ANNOTATION_NAME
							) != null
					);
				})
				?.map(
					(classBodyDeclarationCtx) =>
						classBodyDeclarationCtx.memberDeclaration().fieldDeclaration() ??
						classBodyDeclarationCtx.memberDeclaration().propertyDeclaration()
				)
				?.filter((ctx) => ctx) ?? []
		);
	}

	async generateTypingsForFile(
		filePath: string,
		sObjectApiNamesMap: Map<string, string>,
		namespace?: string
	): Promise<string> {
		return promises
			.readFile(filePath, "utf-8")
			.then((classContent) =>
				this.generateTypings(classContent, sObjectApiNamesMap, namespace)
			);
	}
}
