/**
 * Configuration for the connection
 * Override default config options by calling it with your options.
 * Note the most of those options are related to Puppeteer Cluster options, but
 * also to @Cx.Options
 */
import {DEFAULT} from '../config/configuration';
import {Cluster} from 'puppeteer-cluster';

export default class Connection {
	_options = DEFAULT.PUPPETEER_OPTIONS;
	_cluster!: Cluster;
	async setUp(options?: any) {
		try {
			if (options) {
				this._options = options;
			}

			this._cluster = await Cluster.launch(this._options);

			this._cluster.on('taskerror', (err, data) => {
				throw new Error(`Error crawling ${data}: ${err.message}`);
			});
			return this._cluster;
		} catch (error) {
			console.error(error);
			await this._cluster.close();
		}
	}
}
