import Collect from './collect';
import {performance} from './../helpers/now'
export default class CollectTransfer extends Collect {

	static async atPass(passContext: any) {
		try {
			const {page, startTime, data:url} = passContext;
			const results: any = [];
			const protocol:any = []
			let CDP: any;
			
			page._client.on('Network.loadingFinished', (data: any) => {
				CDP = data;
				
			});

			page._client.on('Network.responseReceived',(data:any) => {
				if(data && data.response.protocol){
					protocol.push({protocol:data.response.protocol, reqId:data.requestId})
				
				}
				
				
				
			})


			page.on('requestfinished', async (request: any) => {
				const response = request.response();
				
				let responseBody;

				if (request.redirectChain().length === 0) {
					// Body can only be access for non-redirect responses
					responseBody = await response.buffer();
					response.uncompressedSize = {
						value: responseBody.length,
						units: 'bytes'
					};
				}

				//delete circular objects 
				delete request._response;
				delete response._request;
				delete response._client;
				delete request._client;
				delete request._frame;


				// Console.log(request);
				// console.log(response);

				// check we are zipping it correctly
				
				if (CDP && request._requestId && CDP.requestId === request._requestId) {
					const information = {
						request:{
							requestId:request._requestId,
							url:request.url(),
							resourceType:request.resourceType(),
							method:request.method(),
							headers:request.headers(),
							fromMemoryCache:request._fromMemoryCache,
							timestamp:performance.now(startTime)

						},
						response:{
							remoteAddress:response.remoteAddress(),
							status:response.status(),
							url:response.url(),
							fromDiskCache:response._fromDiskCache,
							fromServiceWorker: response.fromServiceWorker(),
							headers:response.headers(),
							securityDetails:response.securityDetails(),
							uncompressedSize:response.uncompressedSize,
							timestamp:performance.now(startTime)
						},
						CDP:{
							timestamp:CDP.timestamp,
							compressedSize:CDP.encodedDataLength,
							shouldReportCorbBlocking:CDP.shouldReportCorbBlocking
						}
					};

					results.push(information);
				}

				
			});
			console.log('waiting for navigation to load');

			await page.waitForNavigation({waitUntil:'networkidle0'});

			results.map((info:any)=>{
				info.request.protocol = protocol.find((p:any)=>p.reqId === info.request.requestId).protocol
				return {
					info
				}
			})
			
			
			return {
				record:results
			}
			
			
		} catch (error) {
			console.error('TRANSFER-COLLECT', error);
		}
	}



}
