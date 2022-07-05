export default interface IWiredMethodsTypingsGenerator {
	generateWiredMethodsTypings(
		sObjectNames:string[],
		namespace: string,
		className: string,
		parsedClass
	): Promise<string>;
}
