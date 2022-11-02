export default interface IWiredMethodsTypesGenerator {
	generateWiredMethodTypingsForFile(
		filePath: string,
		sObjectApiNames: string[]
	): Promise<string>;
	generateWiredMethodTypingsForClassContent(
		classContent: string,
		sObjectApiNames: string[]
	): Promise<string>;
}
