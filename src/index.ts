import Connection from './connection/connection';
import {Commander} from './collect/commander';
import {generate} from './helpers/uuid-generator';
import fs from 'fs';
import path from 'path';
import {environment} from '../environment'
import { safeReject } from './helpers/safeReject';
// Fetched dynamically. New requests url here (must include www)
//protocol error network.getResponseBody no resource with given identifier found with url: https://www.uoc.edu
const url = ['https://www.uoc.edu'];

/* SetTimeout(() => {
	url.push('http://example.org/')
	console.log('new url appended')no

}, 60000);
*/


const connection = new Connection();


(async () => {
	const cluster = await connection.setUp();

	try {
		if (cluster) {
			async function handler(passContextRaw: any) {
				
			
				// Mock project Id
				const projectId = generate();
				//important! Place it inside the handler (1 url, 1 commander instance)
				const commander = new Commander(); 
				
				const {page, data: url} = passContextRaw;
				const _page = await commander.setUp(passContextRaw, projectId, cluster);
				const passContext = {page: _page, data: url}


				//@ts-ignore allSettled is not yet typed
				
				const results = await Promise.allSettled([
					commander.navigate(_page!, url),
					commander.asyncEvaluate(passContext)
					
				]);

				//console.log(results[0]);
				

				
				
				//await commander.updateDataLog(results[0].value)
				//console.log(commander._dataLog.traces);
				
				
				


				

				
				
				/*
				const carbonAudit = CarbonFootprintAudit.audit(transferArtifacts.record.map((obj:any)=>{
					return {
						response:obj.response
					}
				}))
				*/
				
				
				
				


				

			if(environment.debug){
				fs.writeFile(
					path.resolve(__dirname, '../traces/datalog.json'),
					JSON.stringify(commander._dataLog),
					err => console.error(err)
				);
			}

			}

			url.forEach(url => {
				cluster.queue(url, handler);
			});

			// Gather traces

			// page events

			// const results = await cluster.execute(url, TransferCollect.afterPass)
			// await new Promise(resolve => setTimeout(resolve, 15000));

			await cluster.idle();
			await cluster.close();

			process.on('unhandledRejection', async (reason, p) => {
				console.error(reason,p);
				throw new Error('Unhandled Rejection at Promise');
			});

			// BeforePass phase

			// pass phase

			// afterPass phase
		}
	} catch (error) {
		safeReject(error)
	
	}
})();
