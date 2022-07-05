export default interface IApexClassTypingsGenerator {
	generateClassTypings(
		sObjectNames: string[],
		namespace: string | null,
		className: string,
		parsedClass
	): Promise<string>;
}
