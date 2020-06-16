export const performance = {
	now(start?: [number, number] | undefined): [number, number] | number {
		if (!start) return process.hrtime();
		const end = process.hrtime(start);
		return Math.round(end[0] * 1000 + end[1] / 1000000);
	}
};
