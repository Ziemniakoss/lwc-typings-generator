export const PLUGIN_NAME = "lwc-typings-generator";

export const LWC_METADATA_FILE_EXTENSION = ".js-meta.xml";

export const FILE_EXTENSIONS = {
	LWC_METADATA_FILE: ".js-meta.xml",
	MESSAGE_CHANNEL_METADATA_FILE: ".messageChannel-meta.xml",
};

export const METADATA_TYPES = {
	MESSAGE_CHANNEL: "LightningMessageChannel",
	CUSTOM_TAB: "CustomTab",
	APPLICATION: "CustomApplication",
};

/**
 * How many records can be read with one query
 */
export const METADATA_READ_COUNT_LIMIT = 10;
