import {Connection} from "jsforce";

export default interface IApexTypingsGenerator {
	generateTypingsForPath(path:string, typingsFolder:string):Promise<any>

	generateTypingsForNamespace(namespace:string | null, typingsFolder:string, connection:Connection):Promise<any>
}
