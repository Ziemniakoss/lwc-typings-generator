import { Connection } from "jsforce";
import { SfdxProject } from "@salesforce/core";

/**
 * Base for helper typings generators.
 */
export default interface IHelperTypesGenerator {
	/**
	 * Generate typings for whole project.
	 * If there are local files for metadata, they will be used to reduce generation time
	 *
	 * @param helperTypesRoot root folder ofr helper types
	 * @param connection connection used to fetch non-existent metadata types
	 */
	generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: Connection
	): Promise<any>;
}
