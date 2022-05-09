export default interface IWiredMethodsTypingsGenerator {
	generateWiredMethodsTypings(namespace:string,className:string, parsedClass):Promise<string>
}
