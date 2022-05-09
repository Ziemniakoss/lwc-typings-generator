import {join} from "path";
import {getResourcesFolder} from "./filesUtils";

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

export async function getQuery(query:string){
	return getApexLanguage().then((language) => language.query(query));
}
