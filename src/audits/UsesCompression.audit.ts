import Audit from "./audit";
/**
 * @fileoverview Audits if compression is used. Instead of looking for the content encoding
 *  Response header, which may not reflect the origin server configuration if it serves 
 *  the files over a CDN, it takes both compressed and uncompressed file sizes, calculates
 *  the compression ratio and comapres it to the threshold.
 */

const RATIO_THRESHOLD = 0.95
export class UsesCompressionAudit extends Audit{
    static get meta(){
        return {
            id:'usescompression',
            title:'Use compression',
            failureTitle:'Dont use compression',
            description:`Compression is important because it reduce the total amount of data transferred to clients`,
            category:'server',
            scoringType: 'transfer'
        } as SA.Audit.Meta
    }


    static audit(traces:SA.DataLog.TransferTrace):SA.Audit.Result|undefined{
try{
    const urls = new Set()
    const compressionRatio = (compressed:number, uncompressed:number) => Number.isFinite(compressed) && compressed > 0 ?
    (compressed / uncompressed) : 1;

    //filter images and woff font formats.
    //js files considered secure (with identifiable content on HTTPS, e.g personal cookies ) should not be compressed (to avoid CRIME & BREACH attacks)
    const resources = traces.record.filter((record)=>{
        const resourceType = record.request.resourceType
        const url = record.response.url
        if(resourceType ==='image') return false
        if(url && url.includes('woff')) return false
        

        const size = record.CDP.compressedSize.value
        const unSize = (record.response.uncompressedSize.value>0?record.response.uncompressedSize.value:0)
        const ratio = compressionRatio(size, unSize)

        if(ratio <RATIO_THRESHOLD) return false

        return true


    }).map((record)=>{
        const url = new URL(record.request.url)

        let path = ''
        let searchParams

        if(url.pathname){
            path=url.pathname

            if(path.length>30){
                path = path.substring(0, path.indexOf('/',2))
            }
        }


        
        const trimUrl = url.hostname + path
        
        const resourceType = record.request.resourceType
        
        return{
            url:trimUrl,
            resourceType
        }
    }).
    filter((record=>{
        if(urls.has(record.url)) return false;
        urls.add(record.url);
        return true
    }))

    const score = Number(resources.length === 0)
    const meta = Audit.successOrFailureMeta(UsesCompressionAudit.meta, score)

        return {
            meta:meta,
            score:score,
            scoreDisplayMode:'binary',
            extendedInfo: {
                value:{
                    results:resources
                }
            }
        }
    }catch(error){
        console.log(error);
        
    }
    }

}