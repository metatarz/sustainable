import Audit from './audit'
export class NoConsoleLogsAudit extends Audit{

    static get meta(){
        return {
            id:'noconsolelogs',
            title:'Doesnt have console logs',
            failureTitle:'Has console logs',
            description:`It is important to keep the console log clean of error, warning or info outputs.`,
            scoringType:'server'
        } as SA.Audit.Meta

    }
        static audit(traces:SA.DataLog.GeneralTrace):SA.Audit.Result{
            
            const resources = traces.console
            return {
                meta:NoConsoleLogsAudit.meta,
                score:Number(resources.length===0),
                scoreDisplayMode:'binary',
                extendedInfo:{
                    value:{
                        results:resources
                    }
                }
            }
        }
    
}