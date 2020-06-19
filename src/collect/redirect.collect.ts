import {Collect} from './collect';
import {safeNavigateTimeout} from '../helpers/navigateTimeout';

export class CollectRedirect extends Collect {
	static async collect(passContext: any): Promise<any> {
		const results: any = [];
		const {page} = passContext;
		page.on('response', (response: any) => {
			const status = response.status();
			const url = response.url();

			if (status >= 300 && status !== 304) {
				// If the 'Location' header points to a relative URL,
				// convert it to an absolute URL.
				// If it already was an absolute URL, it stays like that.
				const redirectsTo = new URL(
					response.headers().location,
					url
				).toString();
				const information = {
					requestId: response._request._requestId,
					url,
					redirectsTo,
					redirectChain: response._request._redirectChain
				};

				results.push(information);
			}
		});
		try {
			console.log('waiting for navigation to load');

			await safeNavigateTimeout(page, 'networkidle0');
			return {
				redirect: results
			};
		} catch (error) {
			console.log('Redirect-Collect', error);
		}
	}
}
