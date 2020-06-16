import {Audit} from './audit';
import csstree = require('css-tree');

const LOCAL_FONTS = [
	'Arial',
	'Arial Black',
	'Comic Sans MS',
	'Georgia',
	'Impact',
	'Times New Roman',
	'Trebuchet MS',
	'Verdana',
	'-apple-system',
	'*'
];

/**
 * @description Find non-local fonts (i.e downloaded) and assert whether they are a subset.
 */
export class UsesFontSubsettingAudit extends Audit {
	static get meta() {
		return {
			id: 'fontsubsetting',
			title: 'Use font subsetting',
			failureTitle: `Don’t use font subsetting`,
			description: `Font subsetting is a method to only download the character sets of use. `,
			category: 'design',
			scoringType: 'fonts'
		} as SA.Audit.Meta;
	}

	// Csstraces / css/ styles/ href | text
	/**
	 * @applicable if uses nonLocalfonts (i.e fonts that are downloaded)
	 *
	 * @fileoverview The workflow is:
	 * 1-Filter out local fonts (not downloaded)
	 * 2-Find for each font if it is subsetted in :
	 *      2.1 @font-face rules using unicode range propiety
	 *
	 *
	 */
	static audit(traces: SA.DataLog.Traces) {
		
		const allFontnames = Object.keys(traces.fonts);
		const nonLocalFonts = allFontnames.filter(
			font => !LOCAL_FONTS.includes(font)
		);
		const fontsCharSets = Array.from(nonLocalFonts).map((font: string) => {
			return {[font]: traces.fonts[font]};
		});

		const fonts = new Set();
		traces.css.sheets
			.map(sheet => {
				const {url} = sheet;
				const ast = csstree.parse(sheet.text);

				// Check subsetting at @font-face (unicode-range)
				const fonts: Array<{fontName: string; hasSubset: boolean}> = [];
				csstree.walk(ast, {
					enter(node: any) {
						if (node.type === 'Atrule' && node.name === 'font-face') {
							const hasSubset: boolean = node.block.children.some((ch: any) => {
								if (ch.property === 'unicode-range') {
									return true;
								}

								return false;
							});

							const fontName: string = node.block.children
								.filter((ch: any) => {
									if (ch.property === 'font-family') {
										return true;
									}

									return false;
								})
								.tail.data.value.children.map((ch: any) => ch.value);

							fonts.push({fontName, hasSubset});
						}
					}
				});

				return {
					url,
					fontSubsets: fonts
				};
			})
			.filter(resource => {
				// We need to compare fontnames to nonLocalFonts array
				if (resource.fontSubsets.some(font => font.hasSubset)) {
					return true;
				}

				return false;
			})
			.filter(resource => {
				if (fonts.has(resource.url)) return false;
				fonts.add(resource.url);
				return true;
			});

		let fontSubsets: SA.DataLog.SubfontFormat[] = [];
		const score = Number(fonts.size > 0);
		if (score === 0) {
			fontSubsets = fontsCharSets;
		}

		const meta = Audit.successOrFailureMeta(
			UsesFontSubsettingAudit.meta,
			score
		);

		return {
			meta,
			score,
			scoreDisplayMode: 'binary',
			extendedInfo: {
				value: Object.assign({}, ...fontSubsets)
			}
		};
	}
}
