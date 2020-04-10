import {Cluster} from 'puppeteer-cluster'
import {Page} from 'puppeteer'
import fs from 'fs'
import { environment } from '../../environment';




export default class Collect{

    
    url:string;
    dataLog:any={}

    constructor(url:string){
        this.url = url
       
    }

    
    options = async ({page, data:url}:any) =>{

        try{
        const results:any = []
        //Full Request and Response Traces
        /*page._client.on('Network.dataReceived', (event:any) => {
            let encoded;
            encoded= event.encodedDataLength;
            
			
        });
        */
        page.on('requestfinished', async (request:any)=>{
            const response = request.response()
            let responseBody;
            if (request.redirectChain().length === 0) {
                // body can only be access for non-redirect responses
                responseBody = await response.buffer();
                response._uncompressedSize={value:responseBody.length,units:'bytes'}
                
            }
            
            const information = {
                request:request,
                response:response                
            }

            results.push(information)
        })

        //page config
        //await page.setGeolocation({latitude: 59.95, longitude: 30.31667});
        /*
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(url  ['geolocation'])
        */
       // await page.setUserAgent('newUserAgent') -->emulating robots
        page.setViewport({width: 1680, height: 952});
        page.setCacheEnabled(false)
        await page._client.send('Network.clearBrowserCookies');
        await page._client.send('Network.clearBrowserCache');
        
        await this._navigate(page,url)
        return results
         
    }catch(e){
        console.error(e);
        
    }
}
    async _navigate(page:Page, url:string){
        try {
            await page.goto(url, {
                waitUntil:'networkidle0', timeout:0
            })
        } catch (error) {
            
        }
    }

    screenshot = async ({page, data:url}:any)=>{
        await this._navigate(page,url)
        const pathName = `sh-${Date.now()}.png`
        await page.screenshot({path:`./traces/screenshots/${pathName}`})
        return pathName
    }

    htmlFile = async ({page, data:url}:any)=>{
        await this._navigate(page,url)
        const bodyHtml = await page.evaluate(()=>document.querySelector('*')!.outerHTML)
        const pathName = `as-${Date.now()}.html`
        fs.writeFile(`./traces/assets/html/${pathName}`,bodyHtml,(err)=>{
console.error(err);

        })
        return bodyHtml
    }

    perfMetrics = async ({page, data:url}:any)=>{
        await this._navigate(page, url)
        const metrics = await page.evaluate(()=>performance.toJSON())
        return metrics
    }

      async run(cluster:Cluster<any,any>){
         try {
             
        
        const results = await cluster.execute(this.url, this.options)
        if (environment.production){
            const screenshot = await cluster.execute(this.url, this.screenshot)
            const htmlFile = await cluster.execute(this.url, this.htmlFile)
            const perfMetrics = await cluster.execute(this.url, this.perfMetrics)
            this.dataLog.screenshotPath=screenshot
            this.dataLog.perfMetrics = perfMetrics
            this.dataLog.htmlPath=htmlFile
        }
        
        await cluster.idle()
        await cluster.close()
        this.dataLog.results = results
        
         }catch (error) {
             console.error(error);
             
        }
    }


    
}