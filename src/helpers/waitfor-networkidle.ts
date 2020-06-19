import {DEFAULT} from '../config/configuration';

export async function waitForNetworkIdle(page: any): Promise<any> {
	const timeoutError = new Error('Timeout while waiting for network idle');

	await new Promise((resolve, reject) => {
		const listener = (event: EventListener) => {
			console.log(event.name);

			if (event.name === 'networkAlmostIdle') {
				page._client.removeListener('Page.lifecycleEvent', listener);
				resolve();
			}
		};

		page._client.on('Page.lifecycleEvent', listener);

		setTimeout(() => {
			page._client.removeListener('Page.lifecycleEvent', listener);
			reject(timeoutError);
		}, DEFAULT.PUPPETEER_OPTIONS.timeout);
	});
}
