import {Page} from 'puppeteer';
import {DEFAULT} from '../config/configuration';
import CollectTransfer from './transfer.collect';
import path from 'path';
import {CollectHTML} from './html.collect';
import fs from 'fs';
// @ts-ignore
import {environment} from '../../environment';
import {CollectConsole} from './console.collect';
import {CollectCSS} from './css.collect';
import {CollectRedirect} from './redirect.collect';
import {CollectFailedTransfers} from './failed-transfer.collect';
import {CollectSubfont} from './subfont.collect';
import {CollectPerformance} from './perf.collect';

interface Value {
	prop: any;
}
interface DataLog {
	[name: string]: Value | any;
}

export class Commander {
	_options = DEFAULT.CONNECTION_OPTIONS;
	_audits = DEFAULT.AUDITS;
	_appOptions = environment;
	_dataLog: DataLog[] = [];
	async setUp(page: Page, pId: string, options?: any) {
		try {
			if (options) {
				this._options = options;
			}

			// Customable
			// page.setJavaScriptEnabled(false); Speeds up process drastically
			page.setViewport({
				width: this._options.emulatedDevices[0].viewport.width,
				height: this._options.emulatedDevices[0].viewport.height
			});
			page.setUserAgent(this._options.emulatedDevices[0].userAgent);
			page.setGeolocation({
				latitude: this._options.locations[0].latitude,
				longitude: this._options.locations[0].longitude,
				accuracy: this._options.locations[0].accuracy
			});
			// We dont want the browser to cache our files
			page.setCacheEnabled(false);
			// Careful with this
			page.setDefaultNavigationTimeout(0);
			// Glyphhanger setup
			// must run here important!
			await page.setBypassCSP(true);
			await page.evaluateOnNewDocument(
				fs.readFileSync(require.resolve('characterset'), 'utf8')
			);
			await page.evaluateOnNewDocument(
				fs.readFileSync(
					path.resolve(__dirname, '../helpers/glyphhanger-script.js'),
					'utf8'
				)
			);

			return page;
		
		} catch (error) {
			console.error(error);
		}
	}

	static async navigate(page: Page, url: string) {
		try {
			console.log('navigating…');
			await page.goto(url, {
				waitUntil: 'networkidle0',
				timeout: 0
			});
			console.log('done navigation');
		} catch (error) {
			console.error('navigation', error);
		}
	}

	async asyncEvaluate(passContext: any, pId: string) {
		try {
			// Const dataLog = this._dataLog.find((_pId)=>_pId.id===pId)
			// TODO Type DataLog
			const dataLog: any = {id: pId, completed: false, traces: {}};
			dataLog.traces = {
				html: {},
				css: {},
				transfer: {},
				general: {},
				fonts: {}
			};

			let html = false;
			let transfer = false;
			let general = false;
			let css = false;
			let fonts = false;
			await new Promise((resolve, reject) => {
				if (dataLog) {
					console.log('running tasks…');

					Object.keys(this._audits).forEach(async (k: string) => {
						switch (k) {
							case 'HTML':
								dataLog.traces.html = await CollectHTML.afterPass(
									passContext,
									this._appOptions
								);
								html = true;
								console.log(`Done ${k}`);
								resolve();
								break;

							case 'TRANSFER':
								const output = await Promise.all([
									CollectTransfer.atPass(passContext),
									CollectFailedTransfers.atPass(passContext),
									CollectRedirect.atPass(passContext)
								]);

								dataLog.traces.transfer.reqres = output[0];
								dataLog.traces.transfer.failed = output[1];
								dataLog.traces.transfer.redirect = output[2];
								transfer = true;
								console.log(`Done ${k}`);

								break;

							case 'GENERAL':
								const generalOut = await Promise.all([
									CollectConsole.afterPass(passContext, this._appOptions),
									CollectPerformance.afterPass(passContext)
								]);

								dataLog.traces.general.console = generalOut[0];
								dataLog.traces.general.performance = generalOut[1];

								general = true;
								console.log(`Done ${k}`);
								break;
							case 'CSS':
								dataLog.traces.css = await CollectCSS.afterPass(passContext);
								css = true;
								console.log(`Done ${k}`);
								break;
							case 'FONTS':
								dataLog.traces.fonts.subfonts = await CollectSubfont.afterPass(
									passContext
								);
								fonts = true;
								console.log(`Done ${k}`);

								break;

							default:
								break;
						}
					});
				}
			});
			if (html && css && transfer && fonts && general)
				console.log('done tasks');
			dataLog.completed = true;
			this._dataLog = [...this._dataLog, dataLog];
		} catch (error) {
			console.error('commander :', error);
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
