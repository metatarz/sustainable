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
            requiredTraces:['transfer','record']
        }
    }


    static audit(traces:SA.DataLog.TransferTrace):SA.Audit.Result{

    const urls = new Set()
    const compressionRatio = (compressed:number, uncompressed:number) => Number.isFinite(compressed) && compressed > 0 ?
    (compressed / uncompressed) : 1;

    //filter images and woff font formats.
    //js files considered secure (with identifiable content on HTTPS) should not be compressed (to avoid CRIME & BREACH attacks)
    const resources = traces.record.filter((record)=>{
        const resourceType = record.request.resourceType
        const headers = record.response.headers
        if(resourceType ==='image') return false
        if(headers['content-type'] && headers['content-type'].includes('woff')) return false


        const size = record.CDP.compressedSize.value
        const unSize = record.response.uncompressedSize.value
        const ratio = compressionRatio(size, unSize)

        if(ratio <RATIO_THRESHOLD) return false

        return true


    }).map((record)=>{
        const url = record.request.url
        const resourceType = record.request.resourceType

        return{
            url,
            resourceType
        }
    }).
    filter((record=>{
        if(urls.has(record.url)) return false;
        urls.add(record.url);
        return true
    }))

        return {
            meta:UsesCompressionAudit.meta,
            score:Number(resources.length === 0),
            scoreDisplayMode:'binary',
            extendedInfo: {
                value:{
                    results:resources
                }
            }
        }
    }
}