
declare global{
    module SA.Audit{
        export interface Meta{
            /** string identifier of the audit */
           
            id:string,
             /** short successful audit title */
            title?:string,
            /** short failed audit title */
            failureTitle?:string,
            /** Audit description, showcasinng importance and useful information */
            description:string,
            /** Audit category: Server or Design */
            category:"server" | "design",
            /** Traces names this audit requires */
            scoringType:ScoreWeights,


        }
        export type ScoreDisplayModes = 
        'numeric'|'binary'|'manual'
    
        export type ScoreDisplayMode = Audit.ScoreDisplayModes[keyof Audit.ScoreDisplayModes];

        export type ScoreWeights = 
        'transfer' | 'general' | 'media' | 'html' | 'js' | 'server' | 'fonts'

        export interface Result{

            score:number | null,
            scoreDisplayMode:ScoreDisplayMode,
            meta:Meta
            extendedInfo?:{value:ExtendedInfo},
            errorMessage?:string,

        }

        export interface ExtendedInfo{
            [key:string]:any
        }
        /**
         * Numeric [0,1]
         * Binary 0 Failed, 1 Passed
         * Manual Requires the user for manual checking
         */
   
    }
}

export{}