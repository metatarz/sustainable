export default function urlIsValid(url:string){
	
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