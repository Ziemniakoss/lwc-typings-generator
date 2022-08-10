type d = Date;
declare namespace apex {
	declare type Id = string;
	declare type Decimal = number;
	declare type Double = number;
	declare type Boolean = boolean;
	declare type Datetime = string | d;
	declare type Integer = number;
	declare type Long = number;
	declare type String = string;
	declare type Time = string;
	declare type Address = any; //TODO
	declare type Date = d | string;
}
interface FetchResponse {
	body: any; //TODO maybe better type
	ok: boolean;
	status: number;
	statusText: string;
}

type PromiseResult<T> = T extends PromiseLike<infer U> ? U : T;
declare interface Wired<T> {
	data: T extends Function ? PromiseResult<ReturnType<T>> : T;
	error: FetchResponse;
}
