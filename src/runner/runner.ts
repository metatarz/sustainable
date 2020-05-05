import Connection from '../connection/connection';
import {Commander} from '../collect/commander';
import {generate} from '../helpers/uuid-generator';
import { safeReject } from '../helpers/safeReject';
import {Queue, Worker, Job, QueueEvents} from 'bullmq'
import { Cluster } from 'puppeteer-cluster';

// Fetched dynamically. New requests url here (must include www)
//protocol error network.getResponseBody no resource with given identifier found with url: https://www.uoc.edu

export default class Runner{

	_cluster={} as Cluster
	_queue={} as Queue

	async init(){

		const connection = new Connection();
		const cluster= await connection.setUp()
		this._cluster=cluster!
		this.queueEvents()
		//crazy workers x3 (not using cluster workers)
		this.run()
		this.run()
		this.run()


		
	}	


	async run(){
		//should work on cluster.queue directly?
		const worker = new Worker('main', async job =>{
			await this.main(job)
			return 12
		
		})
	}

	//TODO move this to server
	queueEvents(){
		const queueEvents = new QueueEvents('main');

			queueEvents.on('waiting', ({ jobId }) => {
			    console.log(`A job with ID ${jobId} is waiting`);
			});

			queueEvents.on('active', ({ jobId, prev }) => {
			    console.log(`Job ${jobId} is now active; previous status was ${prev}`);
			});

			queueEvents.on('completed', ({ jobId, returnvalue }) => {
			    console.log(`${jobId} has completed and returned ${returnvalue}`);
			});

			queueEvents.on('failed', ({ jobId, failedReason }) => {
			    console.log(`${jobId} has failed with reason ${failedReason}`);
			});


	}

	async main(job:Job){

		try {
			const cluster = this._cluster
			if (cluster) {
				const {url} = job.data
	
				
				cluster.queue(url, this.handler.bind(this));
				
				
	
				await cluster.idle();
				await cluster.close();
	
				process.on('unhandledRejection', async (reason, p) => {
					console.error(reason,p);
					throw new Error('Unhandled Rejection at Promise');
				});
	
			}
		} catch (error) {
			safeReject(error)
		
		}
	}

	async handler(passContextRaw: any) {				

		console.log('running handler');
		
		const commander = new Commander()
		// Mock project Id
		const projectId = generate();
		//important! Place it inside the handler (1 url, 1 commander instance)
		
		const {page, data: url} = passContextRaw;
		const _page = await commander.setUp(passContextRaw, projectId, this._cluster);
		const passContext = {page: _page, data: url}
		//@ts-ignore allSettled is not yet typed
		
		const results = await Promise.allSettled([
			commander.navigate(_page!, url),
			commander.asyncEvaluate(passContext)
			
		]);

		return 1234
	}
	
}


