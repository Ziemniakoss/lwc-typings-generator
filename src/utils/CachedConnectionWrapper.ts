import {
	Connection,
	FileProperties,
	ListMetadataQuery,
	Metadata,
} from "jsforce";

/**
 * Wrapper for connection that will first look into cache before quering
 */
export default class CachedConnectionWrapper {
	private readonly cache: Map<string, Promise<any>>;
	private readonly connection: Connection;
	constructor(connection: Connection) {
		this.connection = connection;
		this.cache = new Map<string, Promise<any>>();
	}

	private _metadata: CachedMetadata;

	get metadata() {
		if (this._metadata == null) {
			this._metadata = new CachedMetadata(this.connection, this.cache);
		}
		return this._metadata;
	}
	describeGlobal(): ReturnType<Connection["describeGlobal"]> {
		const key = "describeGlobal";
		if (!this.cache.has(key)) {
			this.cache.set(key, this.connection.describeGlobal());
		}
		return this.cache.get(key);
	}

	describe(type: string) {
		const key = `describe:${type}`;
		if (!this.cache.has(key)) {
			this.cache.set(key, this.connection.describe(type));
		}
		return this.cache.get(key);
	}
}

export class CachedMetadata {
	constructor(
		private connection: Connection,
		private cache: Map<string, Promise<any>>
	) {}

	list(
		queries: ListMetadataQuery | Array<ListMetadataQuery>
	): Promise<Array<FileProperties>> {
		const key = `list:${JSON.stringify(queries)}`;
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}
		const listPromise = this.connection.metadata.list(queries, null, null);
		this.cache.set(key, listPromise);
		return listPromise;
	}

	read(
		type: string,
		fullNames: string | string[]
	): ReturnType<Metadata["read"]> {
		const key = `read:${type}:${fullNames}`;
		if (!this.cache.has(key)) {
			this.cache.set(key, this.connection.metadata.read(type, fullNames));
		}
		return this.cache.get(key);
	}
}
