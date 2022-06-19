declare module "lightning/formattedLocation" {
	export default class FormattedLocation {
		/**
		 * The latitude of the geolocation.
		 * Latitude values must be within -90 and 90.
		 */
		latitude: number;
		/**
		 * The longitude of the geolocation.
		 * Longitude values must be within -180 and 180.
		 */
		longitude: number;
	}
}
