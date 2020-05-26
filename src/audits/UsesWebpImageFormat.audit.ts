import Audit from "./audit";

const APPLICABLE_IMAGE_MIME_TYPES = [
    'image/png',
    'image/jpeg',
]

export class UsesWebpImageFormatAudit extends Audit {
    static get meta(){
        return {
            id:'webpimages',
            title:'Use WebP image format',
            failureTitle:`Don't use WebP image format`,
            description:'WebP images provides superior lossless and lossy compression for images on the web. They maintain a low file size and high quality at the same time.  Although browser support is good (77%) you may use WebP images along with other fallback sources.',
            category:'design',
            scoringType:'media'
        } as SA.Audit.Meta
    }

    /**
     * 
     * @param traces SA.DataLog.TransferTraces
     * Get image format using the MIME/type (header: content-type)
     * WebP should be used against PNG and JPG images
     */
    static audit(traces:SA.DataLog.TransferTrace):SA.Audit.Result{
        const urls = new Set()
        const resources = traces.record.reduce((acc:string[],val)=>
            val.request.resourceType === 'image'
            && APPLICABLE_IMAGE_MIME_TYPES.includes(val.response.headers['content-type']) ? 
            acc.concat(val.request.url) : acc, []
        ).filter((url:any)=>{
            if(urls.has(url)) return false;
            if(url.startsWith('data:')){
                urls.add(url.substr(0,10))
                return false
            }
            urls.add(url);
            return true
        })


        
        const score = Number(urls.size === 0)
        const meta = Audit.successOrFailureMeta(UsesWebpImageFormatAudit.meta, score)
        return {
            meta,
            score,
            scoreDisplayMode:'binary',
            extendedInfo:{
                value:resources
            }
           
        }


    }
}