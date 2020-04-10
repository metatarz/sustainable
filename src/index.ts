import TransferCollect from './collect/transfer.collect'
import Connection from './connection/connection'
import { Commander } from './collect/commander';

import {DEFAULT} from './config/configuration'
import CollectTransfer from './collect/transfer.collect';
//fetched dynamically. New requests url here
const url = ['https://www.example.org','https://www.cartesdamor.cat'];


const connection = new Connection();
const commander = new Commander();
const collectTransfer = new CollectTransfer();


(async ()=>{
    try{
    
    //initial variables
    //start
    const cluster = await connection.setUp()
    const audits = DEFAULT.AUDITS
    //const page = await commander.setUp()

    async function asyncEvaluate(passContextRaw:any){

        try{
        let {page,data:url} = passContextRaw
        //commander.page=page
        
        let _page = await commander.setUp(page)
        

        let passContext = {page:_page,data:url}
        
        audits.TRANSFER.forEach(async target=>{
            switch (target){
                case 'requests_limitation':
                    await collectTransfer.afterPass(passContext)
                default:
                return
            }
        })
        
        
        await Commander.navigate(_page,url)
        console.log(_page)
        
    }catch(e){
        console.error(e);
        
    }
        
    }
  
    
    url.forEach(url=>{
        cluster.queue(url,asyncEvaluate)
        
        
    })

    //Gather traces
    
    

    
    

    //page events

    


    //const results = await cluster.execute(url, TransferCollect.afterPass)
    await cluster.idle()
    await cluster.close()

    process.on('unhandledRejection', async (reason, p) => {
        throw new Error('Unhandled Rejection at Promise');
      });

    

    //beforePass phase
    
    //pass phase

    //afterPass phase
    
    }catch(e){
        console.error(e);
        
    }
})()