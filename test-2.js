const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    const results = []; // collects all results

    let paused = false;
    let pausedRequests = [];
    let total = []

    const nextRequest = () => { // continue the next request or "unpause"
        if (pausedRequests.length === 0) {
            paused = false;
        } else {
            // continue first request in "queue"
            (pausedRequests.shift())(); // calls the request.continue function
        }
    };

    await page.setRequestInterception(true);
    page.setCacheEnabled(false)
    page.on('request', request => {
        if (paused) {
            pausedRequests.push(() => request.continue());
        } else {
            paused = true; // pause, as we are processing a request now
            request.continue();
        }
    });

    page.on('requestfinished', async (request) => {
        const response = request.response();

        const responseHeaders = response.headers();
        let responseBody;
        if (request.redirectChain().length === 0) {
            // body can only be access for non-redirect responses
            responseBody = await response.buffer();
            
        }

        const information = {
            url: request.url(),
            requestHeaders: request.headers(),
            requestPostData: request.postData(),
            responseHeaders: responseHeaders,
            responseSize: responseHeaders['content-length'],
            responseBody:responseBody
        };
        total.push(responseBody.length)
        results.push(information);
        
        nextRequest(); // continue with next request
    });
    page.on('requestfailed', (request) => {
        console.log('request failed')
        nextRequest();
    });

    await page.goto('https://angular.io/guide/architecture-services', { waitUntil: 'networkidle0' });
    
    console.log(results)
    console.log(total.reduce((a,b)=>a+b))
    

    await browser.close();
})();