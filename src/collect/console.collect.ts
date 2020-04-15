import Collect from './collect';
import {ConsoleMessage} from 'puppeteer';

export class CollectConsole extends Collect {
	static async afterPass(passContext: any, options: any): Promise<any> {
		const {page} = passContext;

		const results: object[] = [];
		page.on('console', async (message: ConsoleMessage) => {
			const information = {
				type: message.type(),
				text: message.text()
			};

			if (options.debug) {
				for (let i = 0; i < message.args().length; ++i) {
					console.log(`${i}: ${message.args()[i]}`);
				}
			}

			results.push(information);
		});

		try {
			await page.waitForNavigation({waitUntil:'networkidle0'});
			return results;
		} catch (error) {
			console.error('Console-collect', error);
		}
	}
}
