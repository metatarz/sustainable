/**
 * Configuration for the connection
 * Override default config options by calling it with your options.
 * Note the most of those options are related to Puppeteer Cluster options, but
 * also to @Cx.Options
 */
import {DEFAULT} from '../config/configuration';
import {Cluster} from 'puppeteer-cluster';
import {ClusterOptions} from '../types/cluster-options';

class PuppeteerCluster {
	private options = DEFAULT.PUPPETEER_OPTIONS;
	private cluster: Cluster = {} as Cluster;

	async setUp(options?: ClusterOptions): Promise<any> {
		try {
			if (options) {
				this.options = options;
			}

			this.cluster = await Cluster.launch(this.options);
			this.cluster.on('taskerror', (err, data) => {
				throw new Error(`Error crawling ${data}: ${err.message}`);
			});
			return this.cluster;
		} catch (error) {
			console.error(error);
			await this.cluster.close();
		}
	}
}

export default new PuppeteerCluster();
