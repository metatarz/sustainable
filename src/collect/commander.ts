import {Page} from 'puppeteer';
import {DEFAULT} from '../config/configuration';
import CollectTransfer from './transfer.collect';
import path from 'path';
import {CollectHTML} from './html.collect';
import fs from 'fs';
// @ts-ignore
import {environment} from '../../environment';
import {CollectConsole} from './console.collect';
import {CollectAssets} from './assets.collect';
import {CollectRedirect} from './redirect.collect';
import {CollectFailedTransfers} from './failed-transfer.collect';
import {CollectSubfont} from './subfont.collect';
import {CollectPerformance} from './perf.collect';
import { CollectImages } from './images.collect';
import SystemMonitor from '../vendors/SystemMonitor';
import { performance } from '../helpers/now';
import { createTracker, safeReject } from '../helpers/safeReject';
import { Cluster } from 'puppeteer-cluster';
import Collect from './collect';
import { CarbonFootprintAudit } from '../audits/CarbonFootprint.audit';
import { UsesCompressionAudit } from '../audits/UsesCompression.audit';
import { UsesHTTP2Audit } from '../audits/UsesHTTP2.audit';
import { NoConsoleLogsAudit } from '../audits/NoConsoleLogs.audit';
import { UsesLazyLoadingAudit } from '../audits/UsesLazyLoading.audit';
import cheerio from 'cheerio'


export class Commander {
	_options = DEFAULT.CONNECTION_OPTIONS;
	_audits = DEFAULT.AUDITS;
	_appOptions = environment;
	_dataLog = {} as SA.DataLog.Format;
	_startTime=performance.now()
	_tracker:any
	_cluster={} as Cluster
	async setUp(passContext:any, pId: string, cluster:Cluster, options?: any) {
		try {
			const {page, data:url} = passContext
			if (options) {
				this._options = options;
			}

			
	
			this._tracker = createTracker(page)
			this._cluster = cluster
			this.systemMonitor(this._startTime,'start')

			// Customable
			// page.setJavaScriptEnabled(false); Speeds up process drastically

			await Promise.all([
				page.setViewport({
					width: this._options.emulatedDevices[0].viewport.width,
					height: this._options.emulatedDevices[0].viewport.height
				}),
				page.setUserAgent(this._options.emulatedDevices[0].userAgent),
				page.browserContext().overridePermissions(url, ['geolocation']),
				page.setGeolocation({
					latitude: this._options.locations[1].latitude,
					longitude: this._options.locations[1].longitude,
					accuracy: this._options.locations[1].accuracy
				}),
				page.setCacheEnabled(false),
				page.setBypassCSP(true),
				page.evaluateOnNewDocument(
					fs.readFileSync(require.resolve('characterset'), 'utf8')
				),
				page.setDefaultNavigationTimeout(0),
				page.evaluateOnNewDocument(
					fs.readFileSync(
						path.resolve(__dirname, '../helpers/glyphhanger-script.js'),
						'utf8'
					)
				)
					])

			return page;
		
		} catch (error) {
			safeReject(new Error(`Setup error ${error}`))
		}
	}

	async navigate(page: Page, url: string) {
		try {
			console.log('navigating…');
			await page.goto(url, {
				waitUntil: 'networkidle0',
				timeout: 0
			});
			console.log('done navigation');
		} catch (error) {
			await safeReject(error, this._tracker, this._cluster)
		}
	}

	async asyncEvaluate(passContext: any) {
		try {
			const {page, data:url} = passContext
					console.log('running tasks…');
					//@ts-ignore
					const promiseArray = (Object.keys(this._audits).map(async (k: string) => {
						switch (k) {
							
							case 'HTML':
								 const htmlTraces = await CollectHTML.afterPass(
									passContext,
									this._appOptions
								);
								
								 return null
							

							case 'TRANSFER':
							
								
								const transfer = await Promise.allSettled([
									CollectTransfer.atPass(passContext),
									CollectFailedTransfers.atPass(passContext),
									CollectRedirect.atPass(passContext)
								]);

								const transferTraces = Collect.parseAllSettled(transfer)
								
								return Promise.allSettled([
									UsesCompressionAudit.audit(transferTraces),
									CarbonFootprintAudit.audit(transferTraces,url),
									UsesHTTP2Audit.audit(transferTraces,url)
								])
								

								
							case 'GENERAL':

				
								const general = await Promise.allSettled([
									CollectConsole.afterPass(passContext, this._appOptions),
									CollectPerformance.afterPass(passContext)
								]);
								const generalTraces = Collect.parseAllSettled(general)

								return NoConsoleLogsAudit.audit(generalTraces)
								
							
								
							case 'CSS':
							
								const assets= await CollectAssets.afterPass(passContext)
								return null
								
								
								
								
							case 'FONTS':
					
								const fonts = await CollectSubfont.afterPass(
									passContext
								);

								return null
								
								
								
						
							case 'MEDIA':;
								const mediaTraces = await CollectImages.afterPass(passContext)
								return UsesLazyLoadingAudit.audit(mediaTraces.media)

							default:
								break;
						}
					})
					)

					return promiseArray

		} catch (error) {
			console.error('commander :', error);
		}
	}

	async systemMonitor(time:any, id:string){
		try{
		let cpuUsage:number=0
		let memUsage:number=0

		const systemMonitor = new SystemMonitor()
		await systemMonitor.init()
		const monitor =  () =>
		 cpuUsage = systemMonitor.getCpuUsage().toFixed(1) 
		 memUsage =systemMonitor.getMemoryUsage().toFixed(1)
		monitor()

		const info = {
			id:id,
			cpu:cpuUsage,
			memory:memUsage,
			timestamp:performance.now(time)
		}
		

		this._dataLog.monitor.push(info)
		systemMonitor.close()
	}catch(error){
		console.log('System Monitor', error);
		
	}
	}

	async updateDataLog(data){

		await this.systemMonitor(this._startTime,'run')
		data.map(result=>{
			if(result.status === 'fulfilled' && result.value){
				const keys = Object.keys(result.value)
				if(!Array.isArray(result.value)){

						keys.forEach(key =>{
							//@ts-ignore
							this._dataLog.traces[key] = {...result.value[key]}
						})
					}else{
						console.log(result.value.map((a)=>{
							return {
								...a.result
							}
							
							
							//a.concat(b.result)))
						}))
						

						
					}
				}
				})
				this._dataLog.completed = true;
			}
			
		
		
	

	




	/**
	 * Validate DOMS
	 * POST TO https://validator.w3.org/nu/?out=json
	 * CONTENT : TEXT/HTML
	 * RES JSON
	 */

	/* Async evaluateAsync(expression:any){
        try {
            // `await` is not redundant here because we want to `catch` the async errors
            return await this._evaluateInContext(expression, contextId);
          } catch (err) {
            console.error(err);
            //do something with the error then evaluate again
          }
        }
    }
*/
}
