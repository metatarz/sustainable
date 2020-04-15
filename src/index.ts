import Connection from './connection/connection';
import {Commander} from './collect/commander';
import {generate} from './helpers/uuid-generator';
import fs from 'fs';
import path from 'path';
// Fetched dynamically. New requests url here
const url = ['https://elpais.com/espana/'];

/* SetTimeout(() => {
	url.push('http://example.org/')
	console.log('new url appended')

}, 60000);
*/

const connection = new Connection();
const commander = new Commander();

(async () => {
	const cluster = await connection.setUp();
	try {
		if (cluster) {
			async function handler(passContextRaw: any) {
				// Mock project Id
				const projectId = generate();
				// BeforePass
				const {page, data: url} = passContextRaw;
				const _page = await commander.setUp(page, projectId);
				const passContext = {page: _page, data: url};
				// AtPass

				await Promise.all([
					commander.asyncEvaluate(passContext, projectId),
					Commander.navigate(_page!, url)
				]);

				fs.writeFile(
					path.resolve(__dirname, '../traces/datalog.json'),
					JSON.stringify(commander._dataLog),
					err => console.error(err)
				);

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
