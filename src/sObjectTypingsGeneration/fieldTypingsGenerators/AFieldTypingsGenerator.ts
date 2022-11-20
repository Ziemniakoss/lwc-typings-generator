import { DescribeSObjectResult, Field } from "jsforce";

export default abstract class AFieldTypingsGenerator {
	/**
	 * Generate type definition for given field with JsDocs when possible.
	 * Generated type should assume that it would be used as field definition in interface declaration.
	 * Generated type should:
	 * - be indented with exactly 2 tabs wide
	 * - end with ;
	 *
	 * @param sObjectDescribe
	 * @param field
	 */
	abstract generateTypings(
		sObjectDescribe: DescribeSObjectResult,
		field: Field
	): string;

	/**
	 * Generate JsDocs string for this field.
	 * @param sObjectDescribe
	 * @param field field to generate JsDocs for
	 */
	generateJsDocs(sObjectDescribe: DescribeSObjectResult, field: Field): string {
		if (field.inlineHelpText) {
			return "/**\n" + field.inlineHelpText + "\n*/\n";
		}
		return "";
	}
}
