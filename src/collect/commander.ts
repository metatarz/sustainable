import { Page } from "puppeteer";
import {DEFAULT} from '../config/configuration'

export class Commander{
    _options=DEFAULT.CONNECTION_OPTIONS
    async setUp(page:Page,options?:any){

        try{
        if(options){
            this._options=options
        }

        //customable
            page.setJavaScriptEnabled(false)
            page.setViewport({width:this._options.emulatedDevices[0].viewport.width,
                                    height:this._options.emulatedDevices[0].viewport.height})
            page.setUserAgent(this._options.emulatedDevices[0].userAgent)
            page.setGeolocation({latitude:this._options.locations[0].latitude,
            longitude:this._options.locations[0].longitude,
             accuracy:this._options.locations[0].accuracy})

             return page
        //we dont want the browser to cache our files
       

            }catch(e){
                console.error(e)
            }
                                    
        }

   static async navigate(page:Page, url:string){
        try {
            await page.goto(url, {
                waitUntil:'networkidle0', timeout:0
            })
        } catch (error) {
            console.error(error);
            
        }
    }

    


    /*async evaluateAsync(expression:any){
        try {
            // `await` is not redundant here because we want to `catch` the async errors
            return await this._evaluateInContext(expression, contextId);
          } catch (err) {
            console.error(err);
            //do something with the error then evaluate again
          }
        }
    }
*/
}