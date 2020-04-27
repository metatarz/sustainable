import Connection from './connection/connection';
import {Commander} from './collect/commander';
import {generate} from './helpers/uuid-generator';
import fs from 'fs';
import path from 'path';
import {environment} from '../environment'
import { CarbonFootprintAudit } from './audits/CarbonFootprint.audit';
// Fetched dynamically. New requests url here
const url = ['http://example.org'];

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
				// BeforePass
				const {page, data: url} = passContextRaw;
				const _page = await commander.setUp(page, projectId);
				const passContext = {page: _page, data: url};
				// AtPassd

				//@ts-ignore 
				const results = await Promise.allSettled([
					commander.asyncEvaluate(passContext, projectId),
					Commander.navigate(_page!, url)
				]);

				const transferArtifacts = results[0].value.traces.transfer
				
				
				const carbonAudit = CarbonFootprintAudit.audit(transferArtifacts.reqres.map((obj:any)=>{
					return {
						response:obj.response
					}
				}))
				
				
				


				

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
		console.error('index:', error);
	}
})();
