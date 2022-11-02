export default interface IApexClassesTypesGenerator {
	/**
	 * Generate typings for given class content
	 *
	 * @param classContent apex class content
	 * @param sObjectApiNamesMap map with SObjects api names, where:
	 * - keys are lowercase api names
	 * - values are real api names
	 * @param namespace optional namespace for apex class, used for managed code types generation
	 */
	generateTypings(
		classContent: string,
		sObjectApiNamesMap: Map<string, string>,
		namespace?: string
	): string;

	generateTypingsForFile(
		filePath: string,
		sObjectApiNamesMap: Map<string, string>,
		namespace?: string
	): Promise<string>;
}
