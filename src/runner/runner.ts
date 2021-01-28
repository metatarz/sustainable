import PuppeteerCluster from '../cluster/PuppeteerCluster';
import { Worker } from 'bullmq';
import { Cluster } from 'puppeteer-cluster';
import { DEFAULT } from '../config/configuration';
import { TaskFunctionArguments } from '../types/cluster-options';
import { Sustainability } from 'sustainability'

export default class Runner {
	private cluster: Cluster = {} as Cluster;
	private redisHost = process.env.REDIS_HOST || "127.0.0.1"
	private redisPort = process.env.REDIS_PORT || "6379"

	async init() {
		this.cluster = await PuppeteerCluster.setUp();
		this.run();
	}

	async run() {
		new Worker(
			'main',
			async job => {
				try {
					const { url } = job.data;
					const report = await this.cluster.execute(
						url,
						this.handler.bind(this)
					);
					return report;
				} catch (error) {
					console.log(error);
				}
			},
			{ concurrency: DEFAULT.PUPPETEER_OPTIONS.maxConcurrency, connection: { host: this.redisHost, port: +this.redisPort } }
		);
	}

	async shutdown() {
		try {
			const cluster = this.cluster;
			await cluster.idle();
			await cluster.close();

			process.on('unhandledRejection', async (reason, p) => {
				console.error(reason, p);
				throw new Error('Unhandled Rejection at Promise');
			});
		} catch (error) {
			console.log(error);
		} finally {
			process.exit(1);
		}
	}

	handler(passContextRaw: TaskFunctionArguments<string>) {
		const { page, data: url } = passContextRaw;
		const browser = page.browser()
		const connectionSettings = {
			maxNavigationTime: DEFAULT.CONNECTION_OPTIONS.maxNavigationTime
		};

		const launchSettings = {
			args: [
				'--disable-setuid-sandbox',
				'--no-sandbox',
				'--disable-dev-shm-usage'
			]
		}


		return Sustainability.audit(url, { browser, connectionSettings, launchSettings });
	}
}
