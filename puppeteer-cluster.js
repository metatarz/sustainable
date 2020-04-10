'use strict'
//const geoip = require('geoip-lite')
//const fetch = require('node-fetch') //navigating to pdf pages
const {Cluster} = require('puppeteer-cluster');
//const third = require('./hitProbability') //getCacheHitProbability && computeCacheLifetimeInSeconds
//const parseCacheControl = require('parse-cache-control') //for parsing cache-control


async function main(urls){
    const cluster =  await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 10,
      monitor:true
    });
    const dataLog =[]
    NetworkManager.prototype._onResponseReceived = function (event) {
    const request = this._requestIdToRequest.get(event.requestId);
    // FileUpload sends a response without a matching request.
    if (!request)
        return;
    const response = new Response(this._client, request, event.response);
    response.rawResponse = event.response;   // <<<<<<<<< this is what i add
    request._response = response;
    this.emit(NetworkManager.Events.Response, response);
};

 async function compute({page, data:url}){
    let firstTime = true
    let total= [];
    let wasted = []
    let country
    const requestObj = []
    
    function pdf({data:url}){
        
         fetch(url,{credentials:'same-origin',responseType:'arrayBuffer'})
        .then(response => response.arrayBuffer())
        .then( (arrayBuffer) => {

          total.push(arrayBuffer['byteLength'])
          dataLog.push({url:url,
          weight:total.reduce((a,b)=>a+b)})
      
          
          
      })
      .catch( (error) => {
          console.log('Request failed: ', error);
      }); 
      
    
  } 
 
     page.on('response', response => {
      
        /*if(response._request._resourceType==='image' && firstTime){
          firstTime=false
          const ip = response.remoteAddress().ip
          country = geoip.lookup(ip).country
        }
        */
        let req={}
        const url = response.url();
        if (!url.startsWith('data:') && response.ok) {
          //check for pdfs
          if(response._headers['content-type']=='application/pdf' || url.endsWith('.pdf')){ console.log('requeued'); return cluster.queue(url,pdf)}
            
        
          response.buffer().then(
              b => {
                //console.log(`${response.status()} ${url} ${b.length} bytes ${response.headers()['expires']};`);
                total.push(b.length)
                //assess cache policy and compute wastedbytes
                //TODO: filter out non-cachable assets
                //const seconds = third.computeCacheLifetimeInSeconds(new Map(Object.entries(response.headers())),parseCacheControl(response.headers()['cache-control']),response)
                req.category = response._request['_resourceType']
                req.size = b.length
                req.url = url
                requestObj.push(req)

               // const cacheHit = third.getCacheHitProbability(seconds)
               // wasted.push(Math.round(1 - cacheHit) * b.length)

                
              },
              e => {
                console.log(`${response.status()} ${url} failed: ${e}`);
                
              }
          );
        }
      });
      page.setViewport({width: 1680, height: 952});
      page.setCacheEnabled(false)
      try{
       //page.tracing.start({ path: 'trace.json' });
       await page.goto(url, {
        waitUntil:'networkidle0', timeout:0
      })
      /*Performance*/
      console.log("\n==== performance.toJSON() ====\n");
      console.log(  page.evaluate( () => JSON.stringify(performance.toJSON(), null, "  ") ) );

    }catch(e){
      if (e){
      console.error(e)}
      if (e.message.indexOf('invalid')>-1){
        dataLog.push({url:url, weight:null
        })
      }

      
      
    }
     //page.tracing.stop();
      
      dataLog.push({url:url,
        totalRequests:total.length+1,
        weight:total.reduce((a,b)=>a+b),
        //wasted:wasted.reduce((a,b)=>a+b),
        //country:country,
        request:requestObj
      })
      
    
      
    } 
try{
urls.forEach(url=>{
  cluster.queue(url,compute)
})


 await cluster.idle();
 await cluster.close();


return dataLog
}catch(e){
  console.error(e);
  
}

}

const urls = ['https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-docker/']

main(urls).then(urlData=>console.log(JSON.stringify(urlData)))



/* LOG 

23-2 Added application/pdf navigation via node-fetch
24-2 Added filtering in cache: skipRecord() & isCachable()
25-2 Dep. geoip-lite (sync) geolocation of CDN useful? Yes. 1 less user permission

Page.tracing https://github.com/puppeteer/puppeteer/issues/13

*/

