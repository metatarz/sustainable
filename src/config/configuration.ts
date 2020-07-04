export const DEFAULT: SA.Config.DefaultOptions = {
	PUPPETEER_OPTIONS: {
		concurrency: 2,
		maxConcurrency: 10,
		workerCreationDelay: 0,
		puppeteerOptions: {
			headless: true,
			args: ['--disable-dev-shm-usage', '--shm-size=1gb']
		},
		perBrowserOptions: undefined,
		monitor: true,
		timeout: 90 * 1000,
		retryLimit: 0,
		retryDelay: 0,
		skipDuplicateUrls: false,
		sameDomainDelay: 0,
		puppeteer: undefined
	},
	CONNECTION_OPTIONS: {
		maxThrottle: 5000,
		maxNavigationTime:15000
	}
};
