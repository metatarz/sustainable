import Collect from './collect';
import { waitForNetworkIdle } from '../helpers/waitfor-networkidle';

export class CollectFailedTransfers extends Collect {
	static async atPass(passContext: any): Promise<any> {
		const {page} = passContext;
		const result: any = [];
		page.on('response', (response: any) => {
			const status = response.status;
			const url = response.url;
			if (status >= 400) {
				console.log('failed');

				const information = {
					url,
					code: status,
					statusText:response._statusText,
					failureText:response._request._failureText,
					requestId:response._request._requestId
				};

				result.push(information);
			}
		});

		try {
			console.log('waiting for navigation to load');
			await page.waitForNavigation({waitUntil:'networkidle0'})
			return {
				failed:result
			}
		} catch (error) {
			console.error('Failed-transfer-collect', error);
		}
	}
}
