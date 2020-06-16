import {UsesCompressionAudit} from '../audits/UsesCompression.audit';
import {CollectTransfer} from '../collect/transfer.collect';
import {CollectFailedTransfers} from '../collect/failed-transfer.collect';
import {CollectRedirect} from '../collect/redirect.collect';
import {CollectConsole} from '../collect/console.collect';
import {CarbonFootprintAudit} from '../audits/CarbonFootprint.audit';
import {UsesHTTP2Audit} from '../audits/UsesHTTP2.audit';
import {UsesGreenServerAudit} from '../audits/UsesGreenServer.audit';
import {UsesWebpImageFormatAudit} from '../audits/UsesWebpImageFormat.audit';
import {NoConsoleLogsAudit} from '../audits/NoConsoleLogs.audit';
import {CollectSubfont} from '../collect/subfont.collect';
import {CollectAssets} from '../collect/assets.collect';
import {CollectImages} from '../collect/images.collect';
import {UsesFontSubsettingAudit} from '../audits/UsesFontSubsetting.audit';
import {UsesLazyLoadingAudit} from '../audits/UsesLazyLoading.audit';

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
		maxNavigationTime: 30000,
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
	CATEGORIES: {
		server: {
			description:
				'Server aspects which are essential for online sustainability: green hosting, carbon footprint, data transfer.'
		},
		design: {
			description:
				'Hands-on the website assets that convert code to user-friendly content: images, css stylesheets, scripts, fonts.'
		}
	},
	AUDITS: {
		collectors: [
			CollectTransfer.collect,
			CollectFailedTransfers.collect,
			CollectRedirect.collect,
			CollectConsole.collect,
			CollectSubfont.collect,
			CollectAssets.collect,
			CollectImages.collect
		],
		audits: [
			UsesCompressionAudit.audit,
			CarbonFootprintAudit.audit,
			UsesHTTP2Audit.audit,
			UsesGreenServerAudit.audit,
			UsesWebpImageFormatAudit.audit,
			NoConsoleLogsAudit.audit,
			UsesFontSubsettingAudit.audit,
			UsesLazyLoadingAudit.audit
		]
	},
	REPORT: {
		scoringWeight: {
			server: 0.23076923076923078,
			js: 0.15384615384615385,
			css: 0.07692307692307693,
			html: 0.07692307692307693,
			fonts: 0.07692307692307693,
			media: 0.15384615384615385,
			transfer: 0.23076923076923078
		},
		scoring: {
			CF: {median: 4, p10: 1.2, name: 'Carbon Footprint'}
		}
	}
};
