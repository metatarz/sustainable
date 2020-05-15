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

	static parseAllSettled(data:any, audit?:boolean):any{


		const parser = (res:any)=> {

				if(res.status === 'fulfilled' && res.value){
					return res.value
				}else if(res.status === 'rejected'){
					safeReject(new Error(`Failed with error: ${res.reason}`))
				}
	
			}

			const result = data.map(res=>{
				return parser(res)
			})

			if(!audit){
			return Object.assign({}, ...result)
			}else{
				return result.filter(data=>data).flatMap((data)=>{
				const isArray = Array.isArray(data)
				if(isArray){
					return data.map(d=>d.value)
				}
				
				return data
				
			})
		}
			
			
	}

}
