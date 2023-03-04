declare module "@salesforce/apex" {
	export function refreshApex(cachedApex);
}

declare module "@salesforce/apex/system.Network.getLoginUrl" {
	export default function getLoginUrl(): Promise<string>;
}

declare module "@salesforce/apex/applauncher.IdentityHeaderController.getLogoutUrl" {
	export default function getLogoutUrl(): Promise<string>;
}
