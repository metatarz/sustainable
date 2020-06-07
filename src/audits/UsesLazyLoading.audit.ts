import Audit from "./audit";
import { raw } from "body-parser";
/**
 * Test with https://mathiasbynens.be/demo/img-loading-lazy 
 */
export class UsesLazyLoadingAudit  extends Audit{
    static get meta(){
        return {
            id:'lazyloading',
            title:'Use lazy loading on media assets',
            failureTitle:`Don't use lazy loading on media assets`,
            description:'Lazy loading is a powerful feature. It instructs the browser not to download an asset until an specific event happens. Now it is natively supported on HTML on img and iframe elements. <a href="https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading">More info</a>.',
            category:'design',
            scoringType:'media'
        } as SA.Audit.Meta
    }


    static audit(traces:SA.DataLog.Traces):SA.Audit.Result{
        
        const score = Number(traces.media.lazyImages.length>0)
        const meta = Audit.successOrFailureMeta(UsesLazyLoadingAudit.meta, score)

        

        return {
                meta,
                score,
                scoreDisplayMode:'binary'  
        }
    }
    
}