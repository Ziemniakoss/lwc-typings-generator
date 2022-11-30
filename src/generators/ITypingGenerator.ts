import { SfdxProject } from "@salesforce/core";
import CachedConnectionWrapper from "../utils/CachedConnectionWrapper";

/**
 * Base for typings generators.
 * Legacy generators should implement this interface in the future
 */
export default interface ITypingGenerator {
	/**
	 * Generate typings for whole project.
	 * If there are local files for metadata, they will be used to reduce generation time
	 *
	 * @param project SFDX for which typings should be generated
	 * @param connection connection used to fetch non-existent metadata types
	 * @param deleteExisting should existing typings be deleted?
	 */
	generateForProject(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		deleteExisting: boolean
	): Promise<any>;

	/**
	 * Generate typings only for metadata stored in specific file.
	 * Passed file can have unsupported extension.
	 * In this case, function should just return without throwing exception.
	 *
	 * @param project SFDX project in which this file is included
	 * @param connection connection to org. Implementations should avoid using it if possible
	 * @param filePath path to file for which typings should be generated
	 */
	generateForFile(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		filePath: string
	): Promise<any>;

	/**
	 * Generate typings for metadata with specific type and provided fullNames.
	 *
	 * @param project
	 * @param connection
	 * @param metadataFullNames
	 */
	generateForMetadata(
		project: SfdxProject,
		connection: CachedConnectionWrapper,
		metadataFullNames: string[]
	): Promise<any>;

	/**
	 * Delete all typings generated for given project
	 */
	deleteForProject(project: SfdxProject): Promise<any>;

	/**
	 * Delete typings generated for given file.
	 *
	 * @param project SFDX project
	 * @param filePath file that was source of typing, for example apex class file
	 */
	deleteForFile(project: SfdxProject, filePath: string): Promise<any>;

	/**
	 * Delete typings generated for given metadata
	 *
	 * @param project SFDX project
	 * @param metadataFullNames names of metadata to delete typings for, like for example TestClass if you want to delete typings for TestClass apex class
	 */
	deleteForMetadata(
		project: SfdxProject,
		metadataFullNames: string[]
	): Promise<any>;
}
