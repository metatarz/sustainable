import Collect from './collect';

export default class CollectTransfer extends Collect {
	// TODO: Find how to make page global so we can use it outside afterPass
	transfer: any = [];

	static async atPass(passContext: any): Promise<any> {
		try {
			const {page} = passContext;
			const results: any = [];
			let CDP: any;
			page._client.on('Network.loadingFinished', (data: any) => {
				CDP = data;
			});

			page.on('requestfinished', async (request: any) => {
				const response = request.response();

				let responseBody;

				if (request.redirectChain().length === 0) {
					// Body can only be access for non-redirect responses
					responseBody = await response.buffer();
					response._uncompressedSize = {
						value: responseBody.length,
						units: 'bytes'
					};
				}

				delete request._response;
				delete response._request;
				delete response._client;
				delete request._client;
				delete request._frame;

				// Console.log(request);
				// console.log(response);

				// check we are zipping it correctly
				if (CDP.requestId === request._requestId) {
					const information = {
						request,
						response,
						CDP
					};

					results.push(information);
				}
			});

			console.log('waiting for navigation to load');

			await page.waitForNavigation({waitUntil:'networkidle0'});
			return results;
			
			
		} catch (error) {
			console.error('TRANSFER-COLLECT', error);
		}
	}
}
