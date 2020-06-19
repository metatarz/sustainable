import {Page, NavigationOptions, LoadEvent} from 'puppeteer';
import {DEFAULT} from '../config/configuration';

export async function safeNavigateTimeout(
	page: Page,
	waitUntil?: LoadEvent,
	cb?: CallableFunction
) {
	let stopCallback: any = null;
	const navigate = async () => {
		if (waitUntil) {
			await page.waitForNavigation({waitUntil});
		} else {
			await page.waitForNavigation();
		}

		clearTimeout(stopNavigation);
	};

	const stopPromise = new Promise(x => (stopCallback = x));
	const stopNavigation = setTimeout(
		() => stopCallback(cb),
		DEFAULT.CONNECTION_OPTIONS.maxNavigationTime
	);
	return Promise.race([navigate(), stopPromise]);
}
