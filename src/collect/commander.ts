import {Page} from 'puppeteer';
import {DEFAULT} from '../config/configuration';
import CollectTransfer from './transfer.collect';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import {CollectConsole} from './console.collect';
import {CollectAssets} from './assets.collect';
import {CollectRedirect} from './redirect.collect';
import {CollectFailedTransfers} from './failed-transfer.collect';
import {CollectSubfont} from './subfont.collect';
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
import {UsesGreenServerAudit } from '../audits/UsesGreenServer.audit';
import { UsesFontSubsettingAudit } from '../audits/UsesFontSubsetting.audit';
import { UsesWebpImageFormatAudit } from '../audits/UsesWebpImageFormat.audit';


export class Commander {
	_options = DEFAULT.CONNECTION_OPTIONS;
	_audits = DEFAULT.AUDITS;
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
			//this.systemMonitor(this._startTime,'start')

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

// Do something; once you want to "stop" navigation, call `stopCallback`.
			
			//const tracker = createTracker(page)
			let stopCallback:any = null
			const stopPromise = new Promise(x => stopCallback = x);
			setTimeout(()=>stopCallback(), DEFAULT.CONNECTION_OPTIONS.maxNavigationTime)
			await Promise.race([
				page.goto(url, {
				waitUntil: 'networkidle0',
				timeout: 0
			}),
			stopPromise
			])
			
			
			/*await page.goto(url, {
				waitUntil: 'networkidle0',
				timeout:0
			})
			*/

			
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
							

							case 'SERVER':{
								//@ts-ignore
								const server = await Promise.allSettled([
									CollectTransfer.atPass(passContext),
									CollectFailedTransfers.atPass(passContext),
									CollectRedirect.atPass(passContext),
									CollectConsole.afterPass(passContext)

								]);

								const serverTraces = Collect.parseAllSettled(server)
								//@ts-ignore
								return Promise.allSettled([
									UsesCompressionAudit.audit(serverTraces),
									CarbonFootprintAudit.audit(serverTraces),
									UsesHTTP2Audit.audit(serverTraces,url),
									UsesGreenServerAudit.audit(serverTraces,url),
									UsesWebpImageFormatAudit.audit(serverTraces),
									NoConsoleLogsAudit.audit(serverTraces)
								])
							}

							case 'DESIGN': {
								//@ts-ignore
								const design= await Promise.allSettled([
									CollectSubfont.afterPass(passContext),
									CollectAssets.afterPass(passContext),
									CollectImages.afterPass(passContext)
								])
								const designTraces = Collect.parseAllSettled(design)
								//@ts-ignore
								return Promise.allSettled([
									UsesFontSubsettingAudit.audit(designTraces),
									UsesLazyLoadingAudit.audit(designTraces)
								])
							}

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
