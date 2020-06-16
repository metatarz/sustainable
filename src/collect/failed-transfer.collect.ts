import {Collect} from './collect';
import {safeNavigateTimeout} from '../helpers/navigateTimeout';

export class CollectFailedTransfers extends Collect {
	static async collect(passContext: any): Promise<any> {
		const {page} = passContext;
		const result: any = [];
		page.on('response', (response: any) => {
			const status = response.status;
			const url = response.url;
			if (status >= 400) {
				const information = {
					url,
					code: status,
					statusText: response._statusText,
					failureText: response._request._failureText,
					requestId: response._request._requestId
				};

				result.push(information);
			}
		});

		try {
			console.log('waiting for navigation to load');
			await safeNavigateTimeout(page, 'networkidle0');

			return {
				failed: result
			};
		} catch (error) {
			console.error('Failed-transfer-collect', error);
		}
	}
}
