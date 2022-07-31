declare module 'lightning/mobileCapabilities' {
	type BarcodeType = string

	/**
	 * Scanned barcode
	 */
	interface Barcode {
		type: BarcodeType
		value: string
	}

	/**
	 * Config for scanning session
	 */
	interface BarcodeScannerOptions {
		/**
		 * Types of accepted barcodes
		 */
		barcodeTypes: BarcodeType[]

		/**
		 * Optional text displayed in scanning interface
		 */
		instructionText?: string

		/**
		 * Optional text displayed on scanning success
		 */
		successText?: string
	}

	type BarcodeScannerFailureCode =
		"userDismissedScanner" |
		"userDeniedPermission" |
		"userDisabledPermissions" |
		"unknownReason"

	interface BarcodeScannerFailure {
		code: BarcodeScannerFailureCode
		message:String
	}

	/**
	 *
	 */
	interface BarcodeScanner {
		readonly barcodeTypes: Record<"CODE_128" | "CODE_39" | "CODE_93" | "DATA_MATRIX" | "EAN_13" | "ITF" | "QR" | "UPC_A" | "UPC_E", BarcodeType>

		isAvailable():boolean

		/**
		 * Tries to scan barcode.
		 * Rejected promise returns BarcodeScannerFailure
		 *
		 * @see {@link BarcodeScannerFailure}
		 * @param config
		 */
		beginCapture(config:BarcodeScannerOptions):Promise<Barcode>

		resumeCapture():Promise<Barcode>

		/**
		 * End scanning session.
		 * After ending session by calling this method, you can reuse BarcodeScanner instance by calling beginCapture again
		 */
		endCapture()
	}


	export function getBarcodeScanner(): BarcodeScanner
}
