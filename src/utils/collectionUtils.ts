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
