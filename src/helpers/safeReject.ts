import {Page, Request} from 'puppeteer';
import {Cluster} from 'puppeteer-cluster';
import {Tracker} from '../types/cluster-options';

export async function safeReject(
	error: Error,
	tracker?: any,
	cluster?: Cluster
) {
	if (error.message.startsWith('Navigation timeout' && tracker)) {
		const urls = tracker.urls();
		if (urls.length > 1) {
			error.message += `\nTracked URLs that have not finished: ${urls.join(
				', '
			)}`;
		} else if (urls.length > 0) {
			error.message += `\nFor ${urls[0]}`;
		}

		tracker.dispose();
	}

	if (cluster) {
		await cluster.close();
	}

	console.error(error.message);
}

export function createTracker(page: Page): Tracker {
	const requests = new Set();
	const onStarted = (request: Request) => requests.add(request);
	const onFinished = (request: Request) => requests.delete(request);
	page.on('request', onStarted);
	page.on('requestfinished', onFinished);
	page.on('requestfailed', onFinished);
	return {
		urls: () => Array.from(requests).map((r: any) => r.url()),
		dispose: () => {
			page.removeListener('request', onStarted);
			page.removeListener('requestfinished', onFinished);
			page.removeListener('requestfailed', onFinished);
		}
	};
}
