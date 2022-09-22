declare namespace lightning {
	declare namespace userConsentCookie {
		declare type CategoryName = "Preferences" | "Marketing" | "Statistics";
		declare type ConsentPreference = Record<CategoryName, boolean>;
	}
}
declare module "lightning/userConsentCookie" {
	export function setCookieConsent(
		consentPreference: lightning.userConsentCookie.ConsentPreference
	);

	export function isCategoryAllowedForCurrentConsent(
		category: lightning.userConsentCookie.CategoryName
	): boolean;
}
