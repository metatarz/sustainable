import Audit from "./audit";
import csstree from 'css-tree';

const LOCAL_FONTS= [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Georgia', 'Impact', 'Times New Roman',
    'Trebuchet MS', 'Verdana', '-apple-system','*'
]

/**
 * @description Find non-local fonts (i.e downloaded) and assert whether they are a subset.
 */
export class UsesFontSubsettingAudit extends Audit{

    static get meta(){
        return {
            id:'fontsubsetting',
            title:'Use font subsetting',
            failureTitle:`Don't use font subsetting`,
            description:`Font subsetting is a method to only download the character sets of use. `,
            category:'design',
            scoringType:'fonts'
        } as SA.Audit.Meta
    }
    //csstraces / css/ styles/ href | text
    /**
     * @applicable if uses nonLocalfonts (i.e fonts that are downloaded)
     * 
     * @fileoverview The workflow is: 
     * 1-Filter out local fonts (not downloaded)
     * 2-Find for each font if it is subsetted in :
     *      2.1 @font-face rules using unicode range propiety
     *      
     * @param traces CSS+Fonts traces {fonts, css}
     * 
     */
    static audit(traces:any){

        //TODO need to search if font face matches fontnames*']

        const allFontnames = Object.keys(traces.fonts);
        const nonLocalFonts = allFontnames.filter(font=>!LOCAL_FONTS.includes(font))
        const fontsCharSets = Array.from(nonLocalFonts).map(font=>{return {[font]:traces.fonts[font]}})

        const fonts = new Set()
        traces.css.sheets.map((sheet:SA.DataLog.Sheets)=>{

            const {url} = sheet
            const ast = csstree.parse(sheet.text)


            //check subsetting at @font-face (unicode-range)
            const fonts:any = []
            csstree.walk(ast, {
                enter(node:any){
                    if(node.type==='Atrule' && node.name ==='font-face'){
                       const hasSubset = node.block.children.some(ch=>{
                            if (ch.property === 'unicode-range'){
                                return true
                            }
                        })

                        const fontName = node.block.children.filter(ch=>{
                            if(ch.property === 'font-family'){
                                return true
                            }
                        }).tail.data.value.children.map(ch=>ch.value)

                        fonts.push({fontName, hasSubset})
                        
                    }
                }
            })

            return {
                url,
                fontSubsets:fonts
            }

    }).filter((resource:any)=>{

        //TODO: compare fontnames to nonLocalFonts array
        if(resource.fontSubsets.length>0){
            return true
        }

        return false

    }).
    filter(((record:any)=>{
        if(fonts.has(record.url)) return false;
        fonts.add(record.url);
        return true
    }))

    let fontSubsets:any = []
    const score = Number(fonts.size > 0)
    if(score === 0){
        fontSubsets = fontsCharSets
    }
    const meta = Audit.successOrFailureMeta(UsesFontSubsettingAudit.meta, score)

        return {
            meta:meta,
            score:score,
            scoreDisplayMode:'binary',
            extendedInfo: {
                value:Object.assign({}, ...fontSubsets)
            }
        }
    }

}