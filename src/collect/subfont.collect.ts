import Collect from './collect';
import { safeNavigateTimeout } from '../helpers/navigateTimeout';

export class CollectSubfont extends Collect {
	static async afterPass(passContext: any, options?: any): Promise<any> {
		try {

			//may be interesting to give a try at Page._client.FontFamilies
			const {page} = passContext;
			await safeNavigateTimeout(page)
			const result = await page.evaluate(function(options_: any) {
				try {
					// @ts-ignore
					const hanger = new GlyphHanger();
					hanger.init(document.body, options_);
					const resultJson = hanger.toJSON();

					return resultJson;
				} catch (error) {
					console.error(error.message);
				}
			}, options);
			
			return {
				fonts:result
			}
			
		} catch (error) {
			console.error('Subfont-collect', error);
		}
	}
}
