/**
 * Implemented by classes that generate typings only for wired methods
 */
export default interface IWiredMethodsTypesGenerator {
	generateWiredMethodTypingsForFile(
		filePath: string,
		sObjectApiNames: Map<string, string>
	): Promise<string>;

	generateWiredMethodTypingsForClassContent(
		classContent: string,
		sObjectApiNames: Map<string, string>
	): Promise<string>;
}
