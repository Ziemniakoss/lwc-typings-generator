declare module "@salesforce/client/formFactor" {
	type FormFactor = "Large" | "Medium" | "Small";
	const CLIENT_FORM_FACTOR: FormFactor;
	export default CLIENT_FORM_FACTOR;
}
