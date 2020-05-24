import Audit from "./audit";
import { isGreenServerMem } from "../helpers/isGreenServer";

export class UsesGreenServerAudit extends Audit{
    static get meta(){

        return {
            id:'greenserver',
            title:`Server 100% renewable-powered`,
            failureTitle:`Server running on fossil fuels`,
            description:`It is important to make sure a server uses renewable-powered energy to host a website. Green hosting your website it is as easy as selecting a green web hosting provider.`,
            category:'server',
            scoringType:'server'
        } as SA.Audit.Meta
    }

    static async audit(traces:SA.DataLog.TransferTrace, url:string):Promise<SA.Audit.Result| undefined>{

        const initialHost = new URL(url).host
        const ipAddress = traces.record.
        find(record=>new URL(record.response.url).host === initialHost)?.response.remoteAddress.ip

        
        const {green, hostedby} = await isGreenServerMem(ipAddress!)
        const score = Number(green)
        const meta = Audit.successOrFailureMeta(UsesGreenServerAudit.meta, score)

        return {
            meta,
            score,
            scoreDisplayMode:'binary',
            extendedInfo:{
                value:{hostedby}
            }

        }

        
       
    }

        
}