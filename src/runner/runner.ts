import PuppeteerCluster from '../cluster/PuppeteerCluster';
import { Worker } from 'bullmq';
import { Cluster } from 'puppeteer-cluster';
import { DEFAULT } from '../config/configuration';
import { TaskFunctionArguments } from '../types/cluster-options';
import { Sustainability } from 'sustainability'
import IORedis from 'ioredis';

export default class Runner {
	private cluster: Cluster = {} as Cluster;
	private redisHost = process.env.REDIS_HOST || "127.0.0.1"
	private redisPort = process.env.REDIS_PORT || "6379"
	private redisURL = process.env.REDIS_URL || ''

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
					return undefined
				}
			},
			{ concurrency: DEFAULT.PUPPETEER_OPTIONS.maxConcurrency, connection: this.redisURL? new IORedis(this.redisURL) : { host: this.redisHost, port: +this.redisPort }
		}
		);
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
