export interface ClusterOptions {
	concurrency: number | ConcurrencyImplementationClassType;
	maxConcurrency: number;
	workerCreationDelay: number;
	puppeteerOptions: LaunchOptions;
	perBrowserOptions: LaunchOptions[] | undefined;
	monitor: boolean;
	timeout: number;
	retryLimit: number;
	retryDelay: number;
	skipDuplicateUrls: boolean;
	sameDomainDelay: number;
	puppeteer: any;
}
