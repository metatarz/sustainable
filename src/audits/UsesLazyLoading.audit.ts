import Audit from "./audit";
import { raw } from "body-parser";
/**
 * Test with https://mathiasbynens.be/demo/img-loading-lazy 
 */
export class UsesLazyLoadingAudit  extends Audit{
    static get meta(){
        return {
            id:'lazyloading',
            title:'Uses lazy loading on media assets',
            failureTitle:'Doest use lazy loading on media assets',
            description:'Lazy loading is a powerful feature. It instructs the browser not to download an asset until an specific event happens. Now it is natively supported on HTML on img and iframe elements (e.g: <img loading="lazy" />). Check https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading ',
            category:'design',
            scoringType:'media'
        } as SA.Audit.Meta
    }


    static audit(traces:SA.DataLog.MediaTrace):SA.Audit.Result{

        const urls = new Set()
            traces.images.filter((img)=>{
            const imgAttr = Object.keys(img)
            //search for 'lazy' word inclusion in class attr
    
           if(imgAttr && imgAttr.includes('src')){
               const imageSrc = img.src
               return !(traces.lazyImages.includes(imageSrc))
           }

        }).map(img=>{
            if(img && img.src){
                const rawSrc = img.src
                const cutOn = 25
                const imgSrc = rawSrc.startsWith('data:')?
                rawSrc.substring(-1, rawSrc.length-cutOn)+'#'+rawSrc.length:rawSrc
                return {
                    src: imgSrc
                }
            }
            
        }).filter(data=>{
            if(data){
                if(urls.has(data.src)) return false;
                urls.add(data.src);
                return true
            }
            
        })

        

        return {
                meta:UsesLazyLoadingAudit.meta,
                score:Number(traces.lazyImages.length>0),
                scoreDisplayMode:'binary',
                extendedInfo:{
                    value:{
                        nonLazyImages:urls.entries
                    }
                }
            
        }
    }
    
}