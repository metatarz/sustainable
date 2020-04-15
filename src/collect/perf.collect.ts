import Collect from './collect';

export class CollectPerformance extends Collect {
	static async afterPass(passContext: any): Promise<any> {
		const {page} = passContext;

		await page.waitForNavigation();

		const metrics = await page.evaluate(() => performance.toJSON());

		return metrics;
	}
}
