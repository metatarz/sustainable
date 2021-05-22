import { urlIsValid } from './helpers/validUrl';
import { Queue, QueueEvents } from 'bullmq';
import Runner from './runner/runner';
import express = require('express');
import IORedis from 'ioredis';
const bodyParser = require('body-parser');


export default class App {
	private readonly port: number = Number(process.env.PORT) || 7200;
	private readonly runner: Runner = new Runner();
	private redisHost = process.env.REDIS_HOST || "127.0.0.1"
	private redisPort = process.env.REDIS_PORT || "6379"
	private redisURL = process.env.REDIS_URL || ''

	async init() {
		try {
			const app = express();
			app.use(bodyParser.urlencoded({ extended: true }));
			app.use(bodyParser.json());
			app.listen(this.port, () =>
				console.log('Server running on port :', this.port)
			);

			await this.runner.init();
			const queue = this.initRedis()
			this.listeners(app, queue);

		} catch (error) {
			console.log(error);
		}
	}

	private initRedis(): Queue {

		const queue = new Queue('main', {
			connection: this.redisURL? new IORedis(this.redisURL) : { host: this.redisHost, port: +this.redisPort }

		});
		if (process.env.NODE_ENV !== 'production') {
			this.queueEvents();
		}
		return queue;
	}


	private queueEvents() {
		const queueEvents = new QueueEvents('main', {
			connection: this.redisURL? new IORedis(this.redisURL) : { host: this.redisHost, port: +this.redisPort }

		});
		queueEvents.on('waiting', ({ jobId }) => {
			console.log(`A job with ID ${jobId} is waiting`);
		});

		queueEvents.on('active', ({ jobId, prev }: { jobId: any, prev: any }) => {
			console.log(`Job ${jobId} is now active; previous status was ${prev}`);
		});

		queueEvents.on('completed', ({ jobId, returnvalue }) => {
			console.log(`${jobId} has completed and returned ${returnvalue}`);
		});

		queueEvents.on('failed', ({ jobId, failedReason }) => {
			console.log(`${jobId} has failed with reason ${failedReason}`);
		});
	}

	private listeners(app: express.Application, queue: Queue): void {
		
		const queueEvents = new QueueEvents('main', {
			connection: this.redisURL? new IORedis(this.redisURL) : { host: this.redisHost, port: +this.redisPort }

		});

		app.post(
			'/service/add',
			async (request, res): Promise<any> => {
				let { url } = request.body;
				if (typeof url === 'string') {
					url = url.trim();
				}

				if (typeof url !== 'string' || !urlIsValid(url)) {
					return res.status(400).send({ status: 'Error invalid URL' });
				}

				if (!url.startsWith('http')) {
					url = 'https://' + url;
				}
				try {
					const job = await queue.add('audit', {
						url
					});
					const _jobId = job.id;
					queueEvents.on('completed', async ({ jobId, returnvalue }: { jobId: any, returnvalue: any }) => {
						if (_jobId === jobId) {
							res.status(200).send({ ...returnvalue });
						}
					});
					queueEvents.on('failed', ({ jobId, failedReason }) => {
						if (_jobId === jobId) {
							res.send(500).json(failedReason);
						}
					});
				} catch (e) {
					console.log(e)
					return res.status(400).send({ status: 'Error unknown URL' });

				}


			}
		);
	}
}
