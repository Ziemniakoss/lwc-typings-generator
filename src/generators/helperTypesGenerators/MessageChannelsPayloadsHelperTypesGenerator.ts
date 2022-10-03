import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { Connection } from "jsforce";

/**
 * Generate typings for message channels payloads
 */
export default class MessageChannelsPayloadsHelperTypesGenerator
	implements IHelperTypesGenerator
{
	generateForProject(
		helperTypesRoot: string,
		connection: Connection
	): Promise<any> {
		return Promise.resolve(undefined);
	}
}
