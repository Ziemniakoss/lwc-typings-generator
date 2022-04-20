import { basename, join } from "path";
import { getResourcesFolder } from "./utils/filesUtils";
import { Connection } from "jsforce";
import { existsSync, promises } from "fs";

const Parser = require("web-tree-sitter");

const standardTypesMap = {
	string: "string",
	object: "any",
	sobject: "any",
	list: "any",
	date: "string | Date",
	id: "string",
};

export class ApexTypingsGenerator {
	private readonly sObjectsNames: Readonly<string[]>;
	private readonly connection: Connection;

	constructor(sObjectsNames: string[], connection: Connection) {
		this.sObjectsNames = sObjectsNames;
		this.connection = connection;
	}

	private async getParser(): Promise<any> {
		await Parser.init();
		const parser = new Parser();
		parser.setLanguage(await this.getApexLanguage());
		return parser;
	}

	private async getApexLanguage() {
		const parserPath = join(getResourcesFolder(), "tree-sitter-apex.wasm");
		return Parser.Language.load(parserPath);
	}

	async generateTypings(classOrPath: string, typingsFolder: string) {
		const parser = await this.getParser();
		const { name, content } = await this.getClassContent(classOrPath);
		const t = parser.parse(content);
		return Promise.all([
			this.generateAuraEnabledMethodsTypings(name, typingsFolder, t),
		]);
	}

	private async generateAuraEnabledMethodsTypings(
		className: string,
		typingsFolder: string,
		parsedFile
	) {
		const innerClassesNames = await this.getInnerClassesNames(parsedFile);
		const r = await this.getAuraEnabledMethodsQuery();
		const x = r.matches(parsedFile.rootNode);
		const promises = [];
		for (const methodCapture of x) {
			promises.push(
				this.generateAuraEnabledMethodTypings(
					className,
					typingsFolder,
					methodCapture,
					innerClassesNames
				)
			);
		}
		return Promise.all(promises);
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
			params.push(`${param.childForFieldName("name").text}: ${typeTypings}`);
		}
		if (params.length == 0) {
			return "";
		}
		return `params: {${params.join(",")}}`;
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
				return "apex__" + typeNode.text.replace(".", "__");
		}
		if (typeNode.type == "type_identifier") {
			const id = typeNode.text;
			const idLowerCase = id.toLowerCase();
			if (this.sObjectsNames.includes(idLowerCase)) {
				return id;
			}
			if (innerClasses.includes(idLowerCase)) {
				return `apex__${className}__${id}`;
			}
			if (standardTypesMap[idLowerCase] != null) {
				return standardTypesMap[idLowerCase];
			}
			return `apex__${id}`;
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
				console.log("YES");
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
		console.log("AAAAAAAA", typeIdentifier);
		console.log(typeIdentifier, genericTypes);
		if (typeIdentifier == "map") {
			return `Record<${genericTypes.join(",")}>`;
		} else if (typeIdentifier == "set" || typeIdentifier == "list") {
			return `${genericTypes.join(",")}[]`;
		}
		return "any";
	}

	private async generateAuraEnabledMethodTypings(
		className: string,
		typingsFolder: string,
		methodDeclarationCapture,
		innerClasses: string[]
	) {
		let name = "";
		let paramsTypings = "";
		for (const capture of methodDeclarationCapture.captures) {
			if (capture.name == "name") {
				name = capture.node.text;
			} else if (capture.name == "params") {
				paramsTypings = this.generateParamsTypingString(
					className,
					capture.node,
					innerClasses
				);
			}
		}
		const outputPath = join(typingsFolder, "apex");
		if (!existsSync(outputPath)) {
			await promises.mkdir(outputPath);
		}
		const folder = join(outputPath, "methods");
		if (!existsSync(folder)) {
			await promises.mkdir(folder);
		}
		const typings =
			`declare module "@salesforce/apex${className}.${name}"{\n` +
			`\texport default function ${name}(${paramsTypings}):Promise<any>;\n` +
			`}\n`;
		const fullPath = join(folder, `${className}.${name}.d.ts`);
		console.log(fullPath);
		return promises.writeFile(fullPath, typings);
	}

	async getAuraEnabledMethodsQuery() {
		const query = `
		(method_declaration
			(modifiers
		    	(marker_annotation
		        	name: (identifier) @annotation
		            (#match? @annotation "[aA][uU][rR][aA][eE][nN][aA][bB][lL][eE][dD]")
		        )
		    )
		    name: (identifier) @name
		    parameters: (formal_parameters) @params
		) @method_declaration`;
		return this.getApexLanguage().then((language) => language.query(query));
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
		const q = await this.getApexLanguage().then((language) =>
			language.query(query)
		);
		return q
			.matches(parsedClass.rootNode)
			.map((match) => match.captures.map((capture) => capture.node.text))
			.flat()
			.map((name) => name.toLowerCase());
	}

	async getClassContent(
		classOrPath
	): Promise<{ name: string; content: string }> {
		const fileName = basename(classOrPath);
		const name = fileName.substring(0, fileName.lastIndexOf("."));
		return promises.readFile(classOrPath, "utf-8").then((content) => {
			return {
				name,
				content,
			};
		});
	}
}
