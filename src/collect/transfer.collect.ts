import {Cluster} from 'puppeteer-cluster'
import {Page} from 'puppeteer'
import fs from 'fs'
import { environment } from '../../environment';
import Collect from './collect';
import { Commander } from './commander';




export default class CollectTransfer extends Collect{

    
   
//TODO: Find how to make page global so we can use it outside afterPass
    transfer:any=[]
    constructor(){
        super();
        
    };
    async afterPass(passContext:any){

    const {page, data:url} = passContext
    
    try{
        //const commander = new Commander()
        //commander.page=page
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

        
        //await commander.setUp()
        //await Commander.navigate(page,url)
        this.transfer = results
         
    }catch(e){
        console.error(e);
        
    }
}

    static getPageClass({page,data:url}:any){
        return page
    }


    /*
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

     static async run(cluster:Cluster<any,any>){
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


    */
}
