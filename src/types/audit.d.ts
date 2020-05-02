
declare global{
    module SA.Audit{
        export interface Meta{
            /** string identifier of the audit */
           
            id:string,
             /** short successful audit title */
            title:string,
            /** short failed audit title */
            failureTitle:string,
            /** Audit description, showcasinng importance and useful information */
            description:string,
            /** Traces names this audit requires */
            requiredTraces:Array<string>,


        }
        export type ScoreDisplayModes = 
        'numeric'|'binary'|'manual'
    
        export type ScoreDisplayMode = Audit.ScoreDisplayModes[keyof Audit.ScoreDisplayModes];

        export interface Result{

            score:number | null,
            scoreDisplayMode:ScoreDisplayMode,
            errorMessage?:string
        }
        /**
         * Numeric [0,1]
         * Binary 0 Failed, 1 Passed
         * Manual Requires the user for manual checking
         */
   
    }
}

export{}