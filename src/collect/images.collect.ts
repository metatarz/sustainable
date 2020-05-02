import Collect from "./collect";

export class CollectImages extends Collect{
    static async afterPass(passContext:any){
        const {page} = passContext

        
        await page.waitForNavigation()
        const information = await page.evaluate(()=>{
            return Array.from(document.body.querySelectorAll('img')).map(img => {
                const attrObj:any = {}
                    img.getAttributeNames().forEach(name=>{
                        attrObj[name] = img.getAttribute(name)

                    })
                    return attrObj
                })
            })
        return {
            media:information
        }
    }
}