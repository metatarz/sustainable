import {Page} from 'puppeteer';
import {DEFAULT} from '../config/configuration';
import path = require('path');
import fs = require('fs');
import {createTracker, safeReject} from '../helpers/safeReject';
import {Cluster} from 'puppeteer-cluster';
import {Collect} from './collect';
import {Tracker, TaskFunctionArguments} from '../types/cluster-options';

export class Commander {
	private options = DEFAULT.CONNECTION_OPTIONS;
	private readonly audits = DEFAULT.AUDITS;
	private tracker = {} as Tracker;
	private cluster = {} as Cluster;

	async setUp(
		passContext: TaskFunctionArguments<string>,
		cluster: Cluster,
		options?: SA.Config.ConnectionOptions
	): Promise<any> {
		try {
			const {page, data: url} = passContext;
			if (options) {
				this.options = options;
			}

			this.tracker = createTracker(page);
			this.cluster = cluster;

			// Page.setJavaScriptEnabled(false); Speeds up process drastically

			await Promise.all([
				page.setViewport({
					width: this.options.emulatedDevices[0].viewport.width,
					height: this.options.emulatedDevices[0].viewport.height
				}),
				page.setUserAgent(this.options.emulatedDevices[0].userAgent),
				page.browserContext().overridePermissions(url, ['geolocation']),
				page.setGeolocation({
					latitude: this.options.locations[1].latitude,
					longitude: this.options.locations[1].longitude,
					accuracy: this.options.locations[1].accuracy
				}),
				page.setCacheEnabled(false),
				page.setBypassCSP(true),
				page.evaluateOnNewDocument(
					fs.readFileSync(require.resolve('characterset'), 'utf8')
				),
				page.setDefaultNavigationTimeout(0),
				page.evaluateOnNewDocument(
					fs.readFileSync(
						path.resolve(__dirname, '../bin/glyphhanger-script.js'),
						'utf8'
					)
				)
			]);
			return page;
		} catch (error) {
			safeReject(new Error(`Setup error ${error}`));
		}
	}

	async navigate(page: Page, url: string) {
		try {
			console.log('navigating …');
			let stopCallback: any = null;
			const stopPromise = new Promise(x => (stopCallback = x));
			const navigateAndClearTimeout = async () => {
				await page.goto(url, {
					waitUntil: 'networkidle0',
					timeout: 0
				});
				clearTimeout(stopNavigation);
			};

			const stopNavigation = setTimeout(
				() => stopCallback(),
				DEFAULT.CONNECTION_OPTIONS.maxNavigationTime
			);
			await Promise.race([navigateAndClearTimeout(), stopPromise]);
			page.removeAllListeners('requestfinished');
			page.removeAllListeners('response');
			console.log('done navigation');
		} catch (error) {
			await safeReject(error, this.tracker, this.cluster);
		}
	}

	async asyncEvaluate(passContext: TaskFunctionArguments<any>): Promise<Array<Promise<any>>> {
		try {
			// @ts-ignore
		const traces = await Promise.allSettled(
			this.audits.collectors.map(collect => collect(passContext))
		);
		const parsedTraces = Collect.parseAllSettled(traces);
		// @ts-ignore
		return Promise.allSettled(
			this.audits.audits.map(audit => audit(parsedTraces))
		);
		} catch (error) {
			console.error('commander :', error);
			return new Promise((resolve,_)=>resolve(undefined))
		}
	}
}
