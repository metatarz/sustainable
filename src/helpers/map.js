export function replacer(key, value) {
	const originalObject = this[key];
	if (originalObject instanceof Map) {
		return {
			dataType: 'Map',
			value: Array.from(originalObject.entries()) // Or with spread: value: [...originalObject]
		};
	}

	return value;
}

export function reviver(_, value) {
	if (typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}

	return value;
}
