export function splitIntoSubArrays<T>(
	arr: T[],
	maxSubArraySize: number
): T[][] {
	const result = [];
	let current = [];
	for (const element of arr) {
		if (current.length >= maxSubArraySize) {
			result.push(current);
			current = [];
		}
		current.push(element);
	}
	result.push(current);
	return result;
}

export function wrapInArray(a): any[] {
	if (a == null) {
		return [];
	}
	// @ts-ignore
	return Array.isArray(a) ? a : [a];
}

export function groupBy<T, K>(
	array: T[],
	keyCalculator: (obj: T) => K
): Map<K, T> {
	const result = new Map<K, T>();
	for (const element of array) {
		result.set(keyCalculator(element), element);
	}
	return result;
}
