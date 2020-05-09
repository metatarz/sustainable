import Audit from "./audit";

/**
 * @fileoverview Audit request in the same origin as host use HTTP2.0
 */
export class UsesHTTP2Audit extends Audit{
    static get meta(){
        return {
            id:'useshttp2',
            title:'Use HTTP2',
            failureTitle:'Dont use HTTP2',
            description:`HTTP2 provides advantages such as:
                             multiplexing, server push, binary headers and increased security.`,
            requiredTraces:['transfer','record']
        }
    }
/**
 * @param traces requiredTraces
 */
    static audit(traces:any, url:string):SA.Audit.Result{
    
        const urls = new Set()
        const initialHost = new URL(url).host
        
        const resources = traces.record.filter((record:SA.DataLog.Record)=>{

            const host = new URL(record.request.url).host
            if(record.response.fromServiceWorker) return false
            if(record.request.protocol ==='h2') return false
            if(initialHost !==host) return false
            
            return true
       
        }).map((record:any)=>{
            return {
                protocol:record.request.protocol,
                url:record.request.url
            }
        }).filter((record:any)=>{
            if(urls.has(record.url)) return false;
            urls.add(record.url);
            return true
        })

        return {
            meta:UsesHTTP2Audit.meta,
            score:Number(resources.length === 0),
            scoreDisplayMode:'binary'
           
        }



    }
}