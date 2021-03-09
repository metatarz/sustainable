export const DEFAULT: SA.Config.DefaultOptions = {
	PUPPETEER_OPTIONS: {
		concurrency: 2,
		maxConcurrency: 10,
		workerCreationDelay: 0,
		puppeteerOptions: {
			headless: true,
			args: ['--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
		},
		perBrowserOptions: undefined,
		monitor: process.env.NODE_ENV !== 'production',
		timeout: 90 * 1000,
		retryLimit: 0,
		retryDelay: 0,
		skipDuplicateUrls: false,
		sameDomainDelay: 0,
		puppeteer: undefined
	},
	CONNECTION_OPTIONS: {
		maxThrottle: 5000,
		maxNavigationTime: 15000
	}
};
