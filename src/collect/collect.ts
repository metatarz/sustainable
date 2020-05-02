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

	static parseAllSettled(data:any){
		const map = data.map((res,ind)=>{
			if(res.status === 'fulfilled'){
				return res.value
			}else{
				safeReject(new Error(`Failed at index ${ind} and error: ${res.reason}`))
			}
			})
		return Object.assign({}, ...map)
	}
}
