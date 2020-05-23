import fetch from 'node-fetch'
import { DEFAULT } from '../config/configuration';
import AbortController from 'abort-controller'

export function urlIsValid(url:string){
	
	const regexp = new RegExp(/(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~]*)*(#[\w\-]*)?(\?.*)?/);
	if(!regexp.test(url)) return false

	const notAllowedUrlParts = ['file://', 'localhost', '127.0.0.1', '::1'];
	for(const n in notAllowedUrlParts ){
		if( url.indexOf(notAllowedUrlParts[n]) >= 0 && url.indexOf(notAllowedUrlParts[n]) <= 10 ){
			return false;
		}
	}
	return true;
}

/**
 * This function makes HTTP HEAD request to url to see if it is 
 * reachable and prevents slow network issues
 * @param url string
 */

export async function headTestPassed(url:string){

	//set abortsignal to abort request long than maxThrottle
	const controller = new AbortController()
	const timeout = setTimeout(()=>{
	controller.abort()
		}, DEFAULT.CONNECTION_OPTIONS.maxThrottle)

	try{
	const response = await fetch(url, {method:'HEAD', signal:controller.signal})
	
	if(response){
		const status = response.status
		const headers = response.headers

		if(status>=200 && status <=299 && headers.get('Content-Length')){
			return true
		}
	}

	return false
}catch(error){
	console.log(error);
	return false
	
}finally{
	clearTimeout(timeout)
}

}