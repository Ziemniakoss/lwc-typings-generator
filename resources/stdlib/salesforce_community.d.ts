//https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_community_info

declare module "@salesforce/community/Id" {
	const COMMUNITY_ID: apex.Id;
	export default COMMUNITY_ID;
}

declare module "@salesforce/community/Id" {
	const COMMUNITY_BASE_PATH: string;
	export default COMMUNITY_BASE_PATH;
}

declare module "@salesforce/community/basePath" {
	const basePath: string;
	export default basePath;
}
