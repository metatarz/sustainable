'use strict';
// Const geoip = require('geoip-lite')
// const fetch = require('node-fetch') //navigating to pdf pages
const {Cluster} = require('puppeteer-cluster');
// Const third = require('./hitProbability') //getCacheHitProbability && computeCacheLifetimeInSeconds
// const parseCacheControl = require('parse-cache-control') //for parsing cache-control

async function main(urls) {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_CONTEXT,
		maxConcurrency: 10,
		monitor: true
	});
	const dataLog = [];

	async function compute({page, data: url}) {
		const firstTime = true;
		const total = [];
		const wasted = [];
		let country;
		const requestObject = [];

		function pdf({data: url}) {
			fetch(url, {credentials: 'same-origin', responseType: 'arrayBuffer'})
				.then(response => response.arrayBuffer())
				.then(arrayBuffer => {
					total.push(arrayBuffer.byteLength);
					dataLog.push({url, weight: total.reduce((a, b) => a + b)});
				})
				.catch(error => {
					console.log('Request failed:', error);
				});
		}

		let c = 0;
		page.on('response', response => {
			console.log(c++);
			/* If(response._request._resourceType==='image' && firstTime){
          firstTime=false
          const ip = response.remoteAddress().ip
          country = geoip.lookup(ip).country
        }
        */
			const request = {};
			const url = response.url();
			if (!url.startsWith('data:') && response.ok) {
				// Check for pdfs
				if (
					response._headers['content-type'] == 'application/pdf' ||
					url.endsWith('.pdf')
				) {
					console.log('requeued');
					return cluster.queue(url, pdf);
				}

				response.buffer().then(
					b => {
						// Console.log(`${response.status()} ${url} ${b.length} bytes ${response.headers()['expires']};`);
						total.push(b.length);
						// Assess cache policy and compute wastedbytes
						// TODO: filter out non-cachable assets
						// const seconds = third.computeCacheLifetimeInSeconds(new Map(Object.entries(response.headers())),parseCacheControl(response.headers()['cache-control']),response)
						request.category = response._request._resourceType;
						request.size = b.length;
						request.url = url;
						requestObject.push(request);

						// Const cacheHit = third.getCacheHitProbability(seconds)
						// wasted.push(Math.round(1 - cacheHit) * b.length)
					},
					e => {
						console.log(`${response.status()} ${url} failed: ${e}`);
					}
				);
			}
		});
		page.setViewport({width: 1680, height: 952});
		page.setCacheEnabled(false);
		try {
			// Page.tracing.start({ path: 'trace.json' });
			await page.goto(url, {
				waitUntil: 'networkidle0',
				timeout: 0
			});
			/* Performance */
			console.log('\n==== performance.toJSON() ====\n');
			console.log(
				page.evaluate(() => JSON.stringify(performance.toJSON(), null, '  '))
			);
		} catch (error) {
			if (error) {
				console.error(error);
			}

			if (error.message.includes('invalid')) {
				dataLog.push({url, weight: null});
			}
		}
		// Page.tracing.stop();

		dataLog.push({
			url,
			totalRequests: total.length + 1,
			weight: total.reduce((a, b) => a + b),
			// Wasted:wasted.reduce((a,b)=>a+b),
			// country:country,
			request: requestObject
		});
	}

	try {
		urls.forEach(url => {
			cluster.queue(url, compute);
		});

		await cluster.idle();
		await cluster.close();

		return dataLog;
	} catch (error) {
		console.error(error);
	}
}

const urls = [
	'https://stackoverflow.com/questions/55910981/puppeteer-dont-return-all-requests-from-a-particular-website'
];

main(urls);

/* LOG 

23-2 Added application/pdf navigation via node-fetch
24-2 Added filtering in cache: skipRecord() & isCachable()
25-2 Dep. geoip-lite (sync) geolocation of CDN useful? Yes. 1 less user permission

Page.tracing https://github.com/puppeteer/puppeteer/issues/13

*/
