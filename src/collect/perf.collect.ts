import Collect from './collect';
import SystemMonitor from '../vendors/SystemMonitor';
import { safeNavigateTimeout } from '../helpers/navigateTimeout';

export class CollectPerformance extends Collect {
	static async afterPass(passContext: any): Promise<any> {
		const {page, } = passContext;
		await safeNavigateTimeout(page)
		const perf = await page.evaluate(() => performance.toJSON());
		const metrics = await page.metrics()
		const info = {
			perf,
			metrics,
		}

		return {
			performance:info
		}
	}
}
