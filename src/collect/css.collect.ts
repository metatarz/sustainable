import Collect from './collect';

export class CollectCSS extends Collect {
	static async afterPass(passContext: any, options?: any) {
		try {
			const {page} = passContext;
			// Collect stylesheets
			const sheets: any[] = [];
			page.on('response', (response: any) => {
				const url = response.url();
				const resourceType = response.request().resourceType();
				if (resourceType === 'stylesheet') {
					response.text().then((text: string) => {
						const stylesheet = {
							url,
							text
						};

						sheets.push(stylesheet);
					});
				}
			});
			await page.waitForNavigation();
			const information = await page.evaluate(() => {
				const hrefs: string[] = [];
				const styles: object[] = [];

				const isCssStyleTag = (element:any) =>
					element.tagName === 'STYLE' &&
					(!element.type || element.type.toLowerCase() === 'text/css');

				const isStylesheetLink = (element:any) =>
					element.tagName === 'LINK' &&
					element.href &&
					element.rel.toLowerCase() === 'stylesheet' &&
					!element.href.toLowerCase().startsWith('data:') &&
					!element.href.toLowerCase().startsWith('blob:') &&
					element.media.toLowerCase() !== 'print';

				// #fragments are omitted from puppeteer's response.url(), so
				// we need to strip them from stylesheet links, otherwise the
				// hrefs won't always match when we check for missing ASTs.
				const defragment = (href: string) => href.split('#')[0];
				const pageUrl = defragment(window.location.href);
				// Create a unique identifier for each style tag by appending
				// an xpath-like fragment to the page URL.  This allows us to
				// preserve the relative ordering of external stylesheets and
				// inline style tags.
				const styleTagUri = () => `${pageUrl}#style[${styles.length}]`;
				// Loop over all 'link' and 'style' elements in the document,
				// in order of appearance. For each element, collect the URI
				// of all the ones we're going to assess. For style elements,
				// also extract each tag's content.
				Array.from(document.querySelectorAll('link, style')).forEach(
					(element:any) => {
						if (isStylesheetLink(element)) {
							const href = defragment(element.href);
							hrefs.push(href);
						} else if (isCssStyleTag(element)) {
							const href = styleTagUri();
							const text = element.innerHTML;
							styles.push({href, text});
							hrefs.push(href);
						}
					}
				);

				const information = {hrefs, styles};
				return information;
			});

			return {
				info: information,
				sheets
			};
		} catch (error) {
			console.error('CSS-COLLECT', error);
		}
	}
}
