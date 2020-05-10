import Connection from '../connection/connection';
import {Commander} from '../collect/commander';
import {generate} from '../helpers/uuid-generator';
import { safeReject } from '../helpers/safeReject';
import {Queue, Worker, Job, QueueEvents} from 'bullmq'
import { Cluster } from 'puppeteer-cluster';
import { DEFAULT } from '../config/configuration';
import Collect from '../collect/collect';
import Audit from '../audits/audit';
import { performance } from '../helpers/now';


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

	}	


	async run(){
		//should work on cluster.queue directly?
		const worker = new Worker('main', async job =>{
			//await this.main(job)
			try{
			const {url} = job.data
			const result = await this._cluster.execute(url, this.handler.bind(this));
			return result
			}catch(error){
				safeReject(error)
				
			}
		
		}, {concurrency:DEFAULT.PUPPETEER_OPTIONS.maxConcurrency})
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

	async shutdown(){

		try {
				const cluster = this._cluster
	
				await cluster.idle();
				await cluster.close();
				
	
				process.on('unhandledRejection', async (reason, p) => {
					console.error(reason,p);
					throw new Error('Unhandled Rejection at Promise');
				});
	
		} catch (error) {
			safeReject(error)
		
		}
		finally{
			process.exit(1)
		}
	}

	async handler(passContextRaw: any) {				

		console.log('running handler');
		
		const startTime = Date.now()
		const commander = new Commander()
		// Mock project Id
		const projectId = generate();
		//important! Place it inside the handler (1 url, 1 commander instance)
		
		const {page, data: url} = passContextRaw;
		const _page = await commander.setUp(passContextRaw, projectId, this._cluster);
		const passContext = {page: _page, data: url}
		const promisesArray = await commander.asyncEvaluate(passContext)
		
		//@ts-ignore allSettled lacks typescript support
		const results = await Promise.allSettled([
			commander.navigate(_page!, url),
			...promisesArray!
			
		]);
		
		const resultsParsed = Collect.parseAllSettled(results,true)

		const mapResult = resultsParsed[6].map(({value})=>{
			return {
				value
			}
		})

		const globalScore = Audit.computeScore(mapResult)
		const meta = {
			id:projectId,
			url:url,
			timing:[startTime, Date.now()]
		}
		const mapAudit = mapResult.map((audit)=>{
			return {
				...audit,
			}
		})
		
		return {
			globalScore,
			meta,
			audits:mapAudit,
		}
	}
	
}


