export const DEFAULT: SA.Config.DefaultOptions = {
	PUPPETEER_OPTIONS: {
		concurrency: 2,
		maxConcurrency: 4,
		workerCreationDelay: 0,
		puppeteerOptions: {
			headless: true,
			// Devtools:true,
			args: ['--disable-dev-shm-usage', '--shm-size=1gb']
		},
		perBrowserOptions: undefined,
		monitor: false,
		timeout: 30 * 1000,
		retryLimit: 0,
		retryDelay: 0,
		skipDuplicateUrls: false,
		sameDomainDelay: 0,
		puppeteer: undefined
	},

	CONNECTION_OPTIONS: {
		emulatedDevices: [
			{
				name: 'Desktop 1920x1080',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
				viewport: {
					width: 1920,
					height: 1080
				}
			},
			{
				name: 'Desktop 1024x768',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
				viewport: {
					width: 1024,
					height: 768
				}
			},
			{
				name: 'Laptop 1280x800',
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
				viewport: {
					width: 1280,
					height: 800
				}
			}
		],
		locations: [
			{
				name: 'Barcelona',
				latitude: 41.3851,
				longitude: 2.1734,
				accuracy: 100
			},
			{
				name: 'Bangladesh',
				latitude: 23.685,
				longitude: 90.3563,
				accuracy: 100
			},
			{
				name: 'Seattle',
				latitude: 47.6062,
				longitude: -122.3331,
				accuracy: 100
			},
			{
				name: 'Sydney',
				latitude: -33.8688,
				longitude: 151.2093,
				accuracy: 100
			}
		]
	},

	AUDITS: {
		JS: [
			'minification',
			'bundle',
			'quotification',
			'dependencies',
			'complexity',
			'coverage',
			'tree_shaking'
		],
		CSS: ['minification', 'bundle', 'optimization', 'coverage'],

		HTML: ['minification', 'inline_scripting', 'optimization'],

		MEDIA: [
			'images_limitation',
			'images_compression',
			'images_decorative',
			'images_lazy',
			'video_limitation',
			'video_autoplay'
		],

		FONTS: ['webfonts_limitation', 'compression', 'webfonts_subsets'],

		TRANSFER: [
			'requests_limitation',
			'redirects',
			'resource_type',
			'cacheability',
			'transfer_size'
		],

		GENERAL: [
			'carbon_footprint',
			'console_logs',
			'analytics'
			// 'page_screenshot',
		],

		SERVER: [
			'performance',
			'CDN',
			'green_hosting',
			'up-to-date',
			'overhead_limitations',
			'special_headers',
			'http2',
			'bot_blocking'
		]
	},

	REPORT: {
		scoringWeight: {
			server: 3,
			js: 2,
			css: 1,
			html: 1,
			fonts: 1,
			media: 2,
			transfer: 3
		},
		format: 'json',
		webhook: ''
	}
};
