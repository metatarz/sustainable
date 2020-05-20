import Audit from "./audit";


const LOCAL_FONTS= [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Georgia', 'Impact', 'Times New Roman',
    'Trebuchet MS', 'Verdana'
]
/**
 * @description Find non-local fonts (i.e downloaded) and assert whether they are a subset.
 */
export class UsesFontSubsettingAudit extends Audit{

    static get meta(){
        return {
            id:'fontsubsetting',
            title:'Uses font subsetting',
            failureTitle:'Doesnt use font subsetting',
            description:`Font subsetting is a method to only download the character sets of use. `,
            scoringType:'fonts'
        } as SA.Audit.Meta
    }

    static audit(traces:SA.DataLog.CssTrace){
        const allFontnames = Object.keys(traces.fonts)

        const fonts = new Set()
        //remove local fonts

        allFontnames.filter(font=>!LOCAL_FONTS.includes(font))
        //check subsetting at <link>
        //check subsetting at @font-face (unicode-range)






        
    }

}