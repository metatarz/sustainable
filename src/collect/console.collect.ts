import {Collect} from './collect';
import {ConsoleMessage} from 'puppeteer';
import {safeNavigateTimeout} from '../helpers/navigateTimeout';

export class CollectConsole extends Collect {
	static async collect(passContext: any): Promise<any> {
		const {page} = passContext;

		const results: object[] = [];

		page.on('console', async (message: ConsoleMessage) => {
			const information = {
				type: message.type(),
				text: message.text()
			};

			/* If (options.debug) {
				for (let i = 0; i < message.args().length; ++i) {
					console.log(`${i}: ${message.args()[i]}`);
				}
			}
			*/

			results.push(information);
		});

		try {
			await safeNavigateTimeout(page, 'networkidle0');
			return {
				console: results
			};
		} catch (error) {
			console.error('Console-collect', error);
		}
	}
}
