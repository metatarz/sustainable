import Collect from './collect';

export class CollectSubfont extends Collect {
	static async afterPass(passContext: any, options?: any): Promise<any> {
		try {
			const {page} = passContext;
			await page.waitForNavigation();
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

			return result;
		} catch (error) {
			console.error('Subfont-collect', error);
		}
	}
}
