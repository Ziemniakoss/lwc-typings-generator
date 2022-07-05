import { Connection } from "jsforce";
import {SfdxCommand} from "@salesforce/command";

export default interface IApexTypingsGenerator {
	generateTypingsForPath(sObjectNames:string[],path: string, typingsFolder: string): Promise<any>;

	generateTypingsForNamespace(
		namespace: string | null,
		typingsFolder: string,
		connection: Connection
	): Promise<any>;

	generateTypingsForProject(connection:Connection, project:SfdxCommand["project"]):Promise<any>
}
