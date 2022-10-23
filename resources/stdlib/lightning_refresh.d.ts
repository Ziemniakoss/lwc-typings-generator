//TODO more docs when released
declare module "lightning/refresh" {
	export const REFRESH_COMPLETE: symbol

	export const REFRESH_COMPLETE_WITH_ERRORS: symbol

	export const REFRESH_ERROR: symbol

	export const RefreshEventName: "lightning__refresh"

	//TODO better typings when docs are released
	export function registerRefreshContainer(...args);

	//TODO better typings when docs are released
	export function registerRefreshHandler(...args);

	//TODO better typings when docs are released
	export function unregisterRefreshContainer(...args);

	//TODO better typings when docs are released
	export class RefreshEvent extends CustomEvent {
		constructor(...args)
	}
}
