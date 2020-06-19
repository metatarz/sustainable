import {Collect} from './collect';
import {performance} from '../helpers/now';
import {safeNavigateTimeout} from '../helpers/navigateTimeout';
export class CollectTransfer extends Collect {
	static async collect(passContext: any) {
		try {
			const {page, startTime, data: url} = passContext;
			const results: any = [];
			const protocol: any = [];
			const CDP: any = [];

			page._client.on('Network.loadingFinished', (data: any) => {
				if (data?.encodedDataLength) {
					const {requestId, encodedDataLength} = data;
					CDP.push({requestId, encodedDataLength});
				}
			});

			page._client.on('Network.responseReceived', (data: any) => {
				if (data?.response) {
					protocol.push({
						protocol: data.response.protocol,
						reqId: data.requestId
					});
				}
			});

			page.on('requestfinished', async (request: any) => {
				const response = request.response();
				let responseBody;
				// Body can only be accessed for non-redirect responses
				if (request.redirectChain().length === 0 && response.buffer()) {
					responseBody = await response.buffer();
					response.uncompressedSize = {
						value: responseBody.length ? responseBody.length : 0,
						units: 'bytes'
					};
				} else {
					response.uncompressedSize = {
						value: 0,
						units: 'undefined'
					};
				}

				const information = {
					request: {
						requestId: request._requestId,
						url: request.url(),
						resourceType: request.resourceType(),
						method: request.method(),
						headers: request.headers(),
						fromMemoryCache: request._fromMemoryCache,
						timestamp: performance.now(startTime)
					},
					response: {
						remoteAddress: response.remoteAddress(),
						status: response.status(),
						url: response.url(),
						fromDiskCache: response._fromDiskCache,
						fromServiceWorker: response.fromServiceWorker(),
						headers: response.headers(),
						securityDetails: response.securityDetails(),
						uncompressedSize: response.uncompressedSize,
						timestamp: performance.now(startTime)
					}
				};
				results.push(information);
			});
			console.log('waiting for navigation to load');
			await safeNavigateTimeout(page, 'networkidle0');
			results.map((info: any) => {
				info.request.protocol = protocol.find(
					(p: any) => p.reqId === info.request.requestId
				)?.protocol;
				info.CDP = {
					compressedSize: {
						value:
							CDP.find((r: any) => r.requestId === info.request.requestId)
								?.encodedDataLength || 0,
						units: 'bytes'
					}
				};
				return {
					info
				};
			});
			return {
				url,
				record: results
			};
		} catch (error) {
			console.error('TRANSFER-COLLECT', error);
			return undefined;
		}
	}
}
