declare module "lightning/pageReferenceUtils" {
	/**
	 * Encode default values for standard__objectPage page reference.
	 *
	 * ```js
	 * const defaultValuesForAccount = {
	 *     Name: "Test Name",
	 *     Segment: "Marketing",
	 *     Type: "Big"
	 * }
	 * const encoded = encodeDefaultFieldValues(defaultValuesForAccount);
	 * console.log(encoded); // prints out "Name=Test%20Name,Segment=Marketing,Type=Big"
	 * ```
	 * @return encoded default values
	 */
	export function encodeDefaultFieldValues(
		defaultValues: Record<string, any>
	): string;

	/**
	 * Decodes values from encoded string and returns map of values.
	 * Returned value is wrapped in proxy, you might want to JSON.parse(JSON.stringify(decodedValue)) it.
	 *
	 * ```js
	 * const encoded = "Name=Test%20Name,Segment=Marketing,Type=Big"
	 * const decoded =  decodeDefaultFieldValues(encoded) // {Name: "Test Name", Segment: "Marketing",Type: "Big"}
	 * ``
	 * @param encodedValues
	 */
	export function decodeDefaultFieldValues(encodedValues: string): any;
}
