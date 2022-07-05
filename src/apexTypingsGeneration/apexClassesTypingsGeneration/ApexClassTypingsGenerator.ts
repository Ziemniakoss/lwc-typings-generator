import IApexClassTypingsGenerator from "./IApexClassTypingsGenerator";
import { generateTsType, getQuery } from "../../utils/apexParsingUtils";

export default class ApexClassTypingsGenerator
	implements IApexClassTypingsGenerator
{
	async generateClassTypings(
		sObjectNames:string[],
		namespace: string | null,
		className: string,
		parsedClass
	): Promise<string> {
		const innerClassesNames = await this.getInnerClassesNames(parsedClass);
		let typings = "declare namespace apex {\n";
		if (namespace != null) {
			typings = `declare namespace ${namespace} {\n`;
		}
		typings += `\tdeclare interface ${className} {\n`;

		typings += await Promise.all([
			this.generateTypingsForFields(
				sObjectNames,
				className,
				parsedClass.rootNode,
				innerClassesNames,
				true
			),
			this.generateTypingsForProperties(
				sObjectNames,
				className,
				parsedClass.rootNode,
				innerClassesNames,
				true
			),
		]).then((results) => results.join("\n"));

		typings += "\n\t}\n}\n";
		if (namespace != null) {
			typings += "}\n";
		}

		const innerClassesNodes = await getQuery(`
			(class_declaration
				(class_body
					(class_declaration) @innerClass
				)
			)`)
			.then((q) => q.matches(parsedClass.rootNode))
			.then((captures) => captures.map((c) => c.captures[0].node));

		const innerClassesTypingsGenerationPromises = [];
		for (const innerClassNode of innerClassesNodes) {
			innerClassesTypingsGenerationPromises.push(
				this.generateTypingsForInnerClass(
					sObjectNames,
					namespace,
					className,
					innerClassNode,
					innerClassesNames
				)
			);
		}
		const innerClassesTypings = await Promise.all(
			innerClassesTypingsGenerationPromises
		).then((results) => results.join("\n"));
		return typings + innerClassesTypings;
	}

	private async generateTypingsForInnerClass(
		sObjectNames:string[],
		namespace: string | null,
		className: string,
		innerClassNode,
		innerClassesNames: string[]
	): Promise<string> {
		let typings = `declare namespace apex {`;
		if (namespace != null) {
			typings += ` declare namespace ${namespace}`;
		}
		const innerClassName = innerClassNode.childForFieldName("name").text;
		typings += `declare namespace ${className} {\n\tdeclare interface ${innerClassName} {\n`;

		typings += await Promise.all([
			this.generateTypingsForFields(
				sObjectNames,
				className,
				innerClassNode,
				innerClassesNames,
				false
			),
			this.generateTypingsForProperties(
				sObjectNames,
				className,
				innerClassNode,
				innerClassesNames,
				false
			),
		]).then((results) => results.join("\n"));
		typings += "\n\t}\n}}";
		if (namespace != null) {
			typings += "}";
		}

		return typings + "\n";
	}

	async generateTypingsForProperties(
		sObjectNames:string[],
		className: string,
		parsedClass,
		innerClassesNames: string[],
		isTopLevel: boolean
	): Promise<string> {
		let query = `
		(property_declaration
			(modifiers
				(marker_annotation
					name: (identifier) @annotation
					(#match? @annotation "[aA][uU][rR][aA][eE][nN][aA][bB][lL][eE][dD]")
				)
			)
    		declarator: (variable_declarator
    			name: (identifier) @name
    		)
		) @property`;
		if (isTopLevel) {
			query = `(program (class_declaration (class_body ${query})))`;
		}
		const propertyCapture = await getQuery(query).then((q) =>
			q.matches(parsedClass)
		);
		return propertyCapture
			.map((propertyCapture) => {
				const fieldNode = propertyCapture.captures.filter(
					(c) => c.name == "property"
				)[0].node;
				const fieldName = propertyCapture.captures.filter(
					(c) => c.name == "name"
				)[0].node.text;
				const indent = isTopLevel ? "\t\t" : "\t\t\t";
				return (
					indent +
					this.generateTypingsForProperty(
						sObjectNames,
						className,
						fieldName,
						fieldNode,
						innerClassesNames
					)
				);
			})
			.join("\n");
	}

	private generateTypingsForProperty(
		sObjectNames:string[],
		className: string,
		propertyName: string,
		propertyNode,
		innerClassesNames: string[]
	): string {
		const tsType = generateTsType(
			className,
			propertyNode.childForFieldName("type"),
			innerClassesNames,
			sObjectNames
		);
		return `${propertyName}: ${tsType}`;
	}

	private async generateTypingsForFields(
		sObjectNames:string[],
		className: string,
		parsedClass,
		innerClassesNames: string[],
		isTopLevel: boolean
	): Promise<string> {
		let query = `
		(field_declaration
			(modifiers
				(marker_annotation
					name: (identifier) @annotation
					(#match? @annotation "[aA][uU][rR][aA][eE][nN][aA][bB][lL][eE][dD]")
				)
			)
		    declarator: (variable_declarator
		    	name: (identifier) @name
		    )
		) @field`;
		if (isTopLevel) {
			query = `(program (class_declaration (class_body ${query})))`;
		}
		const fieldsCaptures = await getQuery(query).then((q) =>
			q.matches(parsedClass)
		);
		return fieldsCaptures
			.map((fieldCapture) => {
				const fieldNode = fieldCapture.captures.filter(
					(c) => c.name == "field"
				)[0].node;
				const fieldName = fieldCapture.captures.filter(
					(c) => c.name == "name"
				)[0].node.text;
				const indent = isTopLevel ? "\t\t" : "\t\t\t";
				return (
					indent +
					this.generateTypingsForField(
						sObjectNames,
						className,
						fieldName,
						fieldNode,
						innerClassesNames
					)
				);
			})
			.join("\n");
	}

	private generateTypingsForField(
		sObjectNames:string[],
		className: string,
		fieldName: string,
		fieldNode,
		innerClassesNames: string[]
	): string {
		const tsType = generateTsType(
			className,
			fieldNode.childForFieldName("type"),
			innerClassesNames,
			sObjectNames
		);
		return `${fieldName}: ${tsType}`;
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
