export const PLUGIN_NAME = "lwc-typings-generator";

export const LWC_METADATA_FILE_EXTENSION = ".js-meta.xml";

export const FILE_EXTENSIONS = {
	LWC_METADATA_FILE: ".js-meta.xml",
	MESSAGE_CHANNEL_METADATA_FILE: ".messageChannel-meta.xml",
	APEX_CLASS: ".cls",
};

export const METADATA_TYPES = {
	MESSAGE_CHANNEL: "LightningMessageChannel",
	CUSTOM_TAB: "CustomTab",
	APPLICATION: "CustomApplication",
	FLOW: "Flow",
	GLOBAL_VALUE_SET: "GlobalValueSet",
	APEX_CLASS: "ApexClass"
};

/**
 * How many records can be read with one query
 */
export const METADATA_READ_COUNT_LIMIT = 10;
