interface ColumnHeaderAction {
	checked: boolean;
	label: string;
	name: string;
}

type FieldReference<T> = T | { fieldName: string };

interface BaseColumn {
	label: string;
	fieldName: string;
	/**
	 * Header actions displayed bellow default actions.
	 * When user selects action, "__headeraction__" event is dispatched
	 */
	actions?: ColumnHeaderAction[];
	editable?: boolean;
	fixedWidth?: number;
	hideDefaultActions?: boolean;
	hideLabel?: boolean;
	iconName?: string; //TODO better typings
	initialWidth?: number;
	sortable?: boolean;
	wrapText?: boolean;
	cellAttributes?: CellAttributes;
}

interface CellAttributes {
	iconName?: FieldReference<string>; //TODO better typings
	iconPosition?: FieldReference<"left" | "right">;
	alignment?: FieldReference<"left" | "right" | "center">;
	iconAlternativeText?: FieldReference<string>;
	/**
	 * The label for the icon to be displayed on the right of the icon.
	 */
	iconLabel?: FieldReference<string>;
	class?: FieldReference<string>;
}

interface RowAction {
	label: string; //maybe this can use fieldName
	name: string;
	disabled?: boolean;
	iconName?: string; //TODO better typings
}

interface ActionColumnTypeAttributes {
	rowActions: RowAction[];
	menuAlignment:
		| "right"
		| "left"
		| "auto"
		| "center"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
}

/**
 * Displays __lightning-button-menu__ as menu items
 */
interface ActionColumn extends BaseColumn {
	type: "action";
	typeAttributes: ActionColumnTypeAttributes;
}

interface BooleanColumn extends BaseColumn {
	type: "boolean";
}

interface ButtonColumnTypeAttributes {
	disabled?: FieldReference<boolean>;
	iconName?: FieldReference<string>; //TODO better typings
	label: FieldReference<string>;
	iconPosition?: FieldReference<string>; //TODO better typings
	variant?: FieldReference<string>; //TODO better typings
}

//TODO what about events
interface ButtonColumn {
	type: "button";
	typeAttributes: ButtonColumnTypeAttributes;
}

interface ButtonIconColumnTypeAttributes {
	alternativeText?: FieldReference;
	class: ?FieldReference; //TODO better typings
	disabled?: FieldReference;
	iconClass?: FieldReference;
	iconName?: FieldReference;
	name?: FieldReference;
	title?: FieldReference;
	variant?: FieldReference;
}

interface ButtonIconColumn {
	type: "button-icon";
	typeAttributes: ButtonIconColumnTypeAttributes;
}

//TODO
interface CurrencyColumnTypeAttributes {
	currencyCode: FieldReference<string>; //TODO
	currencyDisplayAs: FieldReference<string>; //TODO
	minimumIntegerDigits?;
	minimumFractionDigits?;
	maximumFractionDigits?;
	minimumSignificantDigits?;
	maximumSignificantDigits?;
	step?: FieldReference<number>;
}

interface CurrencyColumn {
	type: "currency";
	typeAttributes: CurrencyColumnTypeAttributes;
}

type FormattedDateTime = import("lightning/formattedDateTime").default;

interface DateColumnTypeAttributes {
	day: FieldReference<FormattedDateTime["day"]>;
	era: FieldReference<FormattedDateTime["era"]>;
	hour: FieldReference<FormattedDateTime["hour"]>;
	hour12: FieldReference<FormattedDateTime["hour12"]>;
	minute: FieldReference<FormattedDateTime["minute"]>;
	month: FieldReference<FormattedDateTime["month"]>;
	second: FieldReference<FormattedDateTime["second"]>;
	timeZone: FieldReference<FormattedDateTime["timeZone"]>;
	timeZoneName: FieldReference<FormattedDateTime["timeZoneName"]>;
	weekday: FieldReference<FormattedDateTime["weekday"]>;
	year: FieldReference<FormattedDateTime["year"]>;
}

interface DateColumn extends BaseColumn {
	type: "date";
	typeAttributes: DateColumnTypeAttributes;
}

interface DateLocalColumnTypeAttributes {
	day: FieldReference<FormattedDateTime["day"]>;
	month: FieldReference<FormattedDateTime["month"]>;
	year: FieldReference<FormattedDateTime["year"]>;
}

interface DateLocalColumn extends BaseColumn {
	type: "date-local";
	typeAttributes: DateLocalColumnTypeAttributes;
}

interface EmailColumn extends BaseColumn {
	type: "email";
}

type FormattedLocation = import("lightning/formattedLocation").default;

interface LocationColumnTypeAttributes {
	latitude: FieldReference<FormattedLocation["latitude"]>;
	longitude: FieldReference<FormattedLocation["longitude"]>;
}

interface LocationColumn extends BaseColumn {
	type: "location";
	typeAttributes: LocationColumnTypeAttributes;
}

interface NumberColumnTypeAttributes {
	//TODO types?
	minimumIntegerDigits?;
	minimumFractionDigits?;
	maximumFractionDigits?;
	minimumSignificantDigits?;
	maximumSignificantDigits?;
}

/**
 * Displays value using [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/example)
 */
interface NumberColumn extends BaseColumn {
	type: "number";
	typeAttributes: NumberColumnTypeAttributes;
}

interface PercentColumnTypeAttributes {
	//TODO types?
	minimumIntegerDigits?;
	minimumFractionDigits?;
	maximumFractionDigits?;
	minimumSignificantDigits?;
	maximumSignificantDigits?;
	step?;
}

interface PercentColumn extends BaseColumn {
	type: "percent";
	typeAttributes: PercentColumnTypeAttributes;
}

interface PhoneColumn extends BaseColumn {
	type: "phone";
}

type FormattedText = import("lightning/formattedText").default;

interface TextColumnTypeAttributes {
	linkify: FieldReference<FormattedText["linkify"]>;
}

interface TextColumn extends BaseColumn {
	type?: "text";
	typeAttributes?: TextColumnTypeAttributes;
}

type FormattedUrl = import("lightning/formattedUrl").default;

interface UrlColumnTypeAttributes {
	label: FieldReference<FormattedUrl["label"]>;
	target?: FieldReference<FormattedUrl["target"]>;
	tooltip?: FieldReference<FormattedUrl["tooltip"]>;
}

interface UrlColumn extends BaseColumn {
	type: "url";
	typeAttributes: UrlColumnTypeAttributes;
}

type DatatableColumn =
	| ActionColumn
	| BooleanColumn
	| ButtonColumn
	| ButtonIconColumn
	| CurrencyColumn
	| DateColumn
	| DateLocalColumn
	| EmailColumn
	| LocationColumn
	| NumberColumn
	| PercentColumn
	| PhoneColumn
	| TextColumn
	| UrlColumn;

declare module "lightning/datatable" {
	export default class Datatable extends L {
		columns: DatatableColumn[];
		getSelectedRows(): [];
	}
}
