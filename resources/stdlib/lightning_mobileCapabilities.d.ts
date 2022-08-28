declare namespace lightning {
	declare namespace mobileCapabilities {
		declare namespace ContactServiceApi {
			declare interface ContactName {
				/**
				 * A string representing the name to be displayed for the contact.
				 * Only present on Android devices.
				 */
				displayName: string;
				/**
				 * A string representing the contact’s family name (also known as “surname” or “last name”).
				 */
				familyName: string;
				/**
				 * A string representing the contact’s given name (also known as “first name”).
				 */
				givenName: string;
				middleName: string;
				/**
				 * A string representing the contact’s name prefix.
				 */
				namePrefix: string;
				/**
				 * A string representing the contact’s name suffix.
				 */
				nameSuffix: string;
			}

			/**
			 * Labels disclosed in documentation.
			 */
			type KnownLabel = "home" | "homepage" | "work" | "personal" | "mobile";

			declare type ContactLabeledValue = Record<KnownLabel, string>[];

			declare interface ContactAddress {
				type: string;
				streetAddress: string;
				locality: string;
				region: string;
				postalCode: string;
				country: string;
			}

			interface ContactOrganization {
				name: string;
				department: string;
				title: string;
			}

			declare interface Contact {
				id: string;
				name: ContactName;
				phoneNumbers: ContactLabeledValue;
				emails: ContactLabeledValue;
				addresses: ContactAddress;
				/**
				 * An array of objects containing instant messaging (IM) usernames for the contact.
				 */
				ims: ContactLabeledValue;
				organizations: ContactOrganization;
				note: string;
				urls: ContactLabeledValue;
			}

			declare interface ContactServiceFailure {
				code:
					| "USER_DISMISSED"
					| "USER_DENIED_PERMISSION"
					| "USER_DISABLED_PERMISSION"
					| "USER_RESTRICTED_PERMISSION"
					| "SERVICE_NOT_ENABLED"
					| "UNKNOWN_REASON";
				message: string;
			}

			declare interface ContactsServiceOptions {
				/**
				 * Optional parameter, for Android only.
				 * This only appears after an initial denial by the user.
				 * To use the default permission message, pass in an empty object.
				 *
				 * The default permission message is “To import Contacts, permission is needed to access Contacts.
				 * Tap Allow in the following permissions dialog.”
				 */
				permissionRationaleText?: string;
			}

			declare interface ContactService {
				isAvailable(): boolean;
				getContacts(
					options: lightning.mobileCapabilities.ContactServiceApi.ContactsServiceOptions
				): Promise<lightning.mobileCapabilities.ContactServiceApi.Contact[]>;
			}
		}

		declare namespace BarcodeScannerApi {
			type BarcodeType = string;

			/**
			 * Scanned barcode
			 */
			declare interface Barcode {
				type: BarcodeType;
				value: string;
			}

			/**
			 * Config for scanning session
			 */
			declare interface BarcodeScannerOptions {
				/**
				 * Types of accepted barcodes
				 */
				barcodeTypes: BarcodeType[];

				/**
				 * Optional text displayed in scanning interface
				 */
				instructionText?: string;

				/**
				 * Optional text displayed on scanning success
				 */
				successText?: string;
			}

			type BarcodeScannerFailureCode =
				| "userDismissedScanner"
				| "userDeniedPermission"
				| "userDisabledPermissions"
				| "unknownReason";

			declare interface BarcodeScannerFailure {
				code: BarcodeScannerFailureCode;
				message: String;
			}

			declare interface BarcodeScanner {
				readonly barcodeTypes: Record<
					| "CODE_128"
					| "CODE_39"
					| "CODE_93"
					| "DATA_MATRIX"
					| "EAN_13"
					| "ITF"
					| "QR"
					| "UPC_A"
					| "UPC_E",
					BarcodeType
				>;

				isAvailable(): boolean;

				/**
				 * Tries to scan barcode.
				 * Rejected promise returns BarcodeScannerFailure
				 *
				 * @see {@link BarcodeScannerFailure}
				 * @param config
				 */
				beginCapture(config: BarcodeScannerOptions): Promise<Barcode>;

				resumeCapture(): Promise<Barcode>;

				/**
				 * End scanning session.
				 * After ending session by calling this method, you can reuse BarcodeScanner instance by calling beginCapture again
				 */
				endCapture();
			}
		}
	}
}

declare module "lightning/mobileCapabilities" {
	export function getBarcodeScanner(): lightning.mobileCapabilities.BarcodeScannerApi.BarcodeScanner;

	export function getContactsService(): lightning.mobileCapabilities.ContactServiceApi.ContactService;
}
