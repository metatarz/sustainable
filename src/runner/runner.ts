import Connection from '../connection/connection';
import {Commander} from '../collect/commander';
import {generate} from '../helpers/uuid-generator';
import {safeReject} from '../helpers/safeReject';
import {Worker} from 'bullmq';
import {Cluster} from 'puppeteer-cluster';
import {DEFAULT} from '../config/configuration';
import {Collect} from '../collect/collect';
import {Audit} from '../audits/audit';

export default class Runner {
	private cluster: Cluster = {} as Cluster;

	async init() {
		const connection = new Connection();
		this.cluster = await connection.setUp();
		this.run();
	}

	async run() {
		new Worker(
			'main',
			async job => {
				try {
					const {url} = job.data;
					const result = await this.cluster.execute(
						url,
						this.handler.bind(this)
					);
					return result;
				} catch (error) {
					safeReject(error);
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
			safeReject(error);
		} finally {
			process.exit(1);
		}
	}

	async handler(passContextRaw: any) {
		const startTime = Date.now();
		const commander = new Commander();

		const projectId = generate();
		const {_, data: url} = passContextRaw;
		const _page = await commander.setUp(passContextRaw, this.cluster);
		const passContext = {...passContextRaw, page: _page, data: url};

		// @ts-ignore allSettled lacks typescript support
		const results = await Promise.allSettled([
			commander.navigate(_page, url),
			commander.asyncEvaluate(passContext)
		]);

		const resultsParsed = Collect.parseAllSettled(results, true);
		const audits = Audit.groupAudits(resultsParsed);
		const globalScore = Audit.computeScore(audits);

		const meta = {
			id: projectId,
			url,
			timing: [startTime, Date.now()]
		};
		return {
			globalScore,
			meta,
			audits
		};
	}
}
