import { safeReject } from "../helpers/safeReject"

export interface PassContext {
	page: any;
	data: {
		url: string;
	};
}

export default class Collect {
	beforePass(passContext: PassContext): any {}

	atPass(passContext: PassContext): any {}

	afterPass(passContext: PassContext): any {}

	static parseAllSettled(data:any, audit?:boolean){

		const map = data.map((res,ind)=>{
			if(res.status === 'fulfilled' && res.value){
				return res.value
			}else if(res.status === 'rejected'){
				safeReject(new Error(`Failed at index ${ind} and error: ${res.reason}`))
			}
			})
		if(!audit){
			return Object.assign({}, ...map)
		}else{
			return map
				
			
		}
		
	}
}
