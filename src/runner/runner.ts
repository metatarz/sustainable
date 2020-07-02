import PuppeteerCluster from '../cluster/PuppeteerCluster';
import {Worker} from 'bullmq';
import {Cluster} from 'puppeteer-cluster';
import {DEFAULT} from '../config/configuration';
import {TaskFunctionArguments} from '../types/cluster-options';
import {Sustainability} from 'sustainability';

export default class Runner {
	private cluster: Cluster = {} as Cluster;

	async init() {
		this.cluster = await PuppeteerCluster.setUp();
		this.run();
	}

	async run() {
		new Worker(
			'main',
			async job => {
				try {
					const {url} = job.data;
					const report = await this.cluster.execute(
						url,
						this.handler.bind(this)
					);
					return report;
				} catch (error) {
					console.log(error);
				}
			},
			{concurrency: DEFAULT.PUPPETEER_OPTIONS.maxConcurrency}
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

	async handler(passContextRaw: TaskFunctionArguments<string>) {
		const {page, data: url} = passContextRaw;

		return Sustainability.audit(url);
	}
}
