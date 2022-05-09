type d = Date
declare namespace apex {
	declare type Id = string
	declare type Decimal = number
	declare type Double = number
	declare type Boolean = boolean
	declare type Datetime = any // TODO
	declare type Integer = number
	declare type Long = number
	declare type String = string
	declare type Time = any // TODO
	declare type Address = any //TODO
	declare type Date = d | string
}
