import {Collect} from './collect';

export class CollectJs extends Collect {
	static async collect(passContext: any) {
		const {page} = passContext;
		const assets: any[] = [];

		page.on('response', async (response: any) => {
			const url = response.url();
			const resourceType = response.request().resourceType();
			if (resourceType === 'script') {
				const text = await response.text();
				const script = {
					url,
					text
				};

				assets.push(script);
			}
		});
	}
}
