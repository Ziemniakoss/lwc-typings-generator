export default interface IApexClassTypingsGenerator {
	generateClassTypings(
		namespace: string | null,
		className: string,
		parsedClass
	): Promise<string>;
}
