import Collect from "./collect";

export class CollectImages extends Collect{
    static async afterPass(passContext:any){
        const {page} = passContext;
        const lazyImages:string[] = []

        await page.waitForNavigation({waitUntil:'networkidle0'});

        const fetchImages = async ()=> {
            return await page.evaluate(()=>{
                return Array.from(document.body.querySelectorAll('img')).map(img => {
                    const attrObj:any = {}
                        img.getAttributeNames().forEach(name=>{
                            attrObj[name] = img.getAttribute(name)
    
                        })
                        return attrObj
                    })
                })
        }

        const images = await fetchImages()
        page.on('requestfinished',(request:any)=>{
            if(request.resourceType()==="image"){
                lazyImages.push(request.url)
                
            }
            
        })
        
        //scroll function credits to nagy.zsolt.hun https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
            await page.evaluate(() => new Promise((resolve) => {
                let scrollTop = -1;
                const interval = setInterval(() => {
                  window.scrollBy(0, 100);
                  if(document.documentElement.scrollTop !== scrollTop) {
                    scrollTop = document.documentElement.scrollTop;
                    return;
                  }
                  clearInterval(interval);
                  resolve();
                }, 10);
              }));   

        const information = {
            images,
            lazyImages

        }

        return {
            media:information
        }
    }
}