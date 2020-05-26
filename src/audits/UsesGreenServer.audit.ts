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

        const initialHost = new URL(url).hostname
        //check for redirects in initial host
        const hosts = new Set()
        
        hosts.add(initialHost)

        const redirect = traces.redirect?.find(record=>new URL(record.url).hostname===initialHost)?.redirectsTo

        if(redirect){
            hosts.add(new URL(redirect).hostname)
        }
        

        const ipAddress = traces.record.
        find(record=>{
            const hostname = new URL(record.response.url).hostname
            return Array.from(hosts.values()).includes(hostname)?true:false
        })?.response.remoteAddress.ip
        
        const {green, hostedby} = await isGreenServerMem(ipAddress!)

        const score = Number(green) || 0    
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