import Audit from "./audit";


export class CarbonFootprintAudit extends Audit{
    static get meta(){

        return {
            id:'carbonfootprint',
            title:'',
            failureTitle:'',
            description:'',
            requiredTraces:['transfer','reqres','response']
        }
    }

    static async audit(artifacts:any):Promise<SA.Audit.Result>{

        
        const totalTransfersize = artifacts.
        map(
            (el:any)=>el.response._uncompressedSize.value).
        reduce(
            (total:number,actual:number)=>total+actual)

        //get constants from json file
        const metric = totalTransfersize*0.95*400
        //convert

        


        return {
            score:1,
            scoreDisplayMode:{display:'numeric'}

        }
    }
    
}

