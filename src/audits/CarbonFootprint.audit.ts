import Audit from "./audit";
import geoip from 'geoip-lite';
import memoize from 'memoizee';
import fetch from 'node-fetch'
import { variables } from "../references/references";
import { DEFAULT } from "../config/configuration";
import { sum } from "../bin/statistics";

/**
 * @fileoverview Compute gCO2eq / visit considering server location, 
 *                  server greenness per individual resource.
 */

const GREEN_SERVER_API = 'http://api.thegreenwebfoundation.org/greencheck'
const MB_TO_BYTES = 1024 * 1024
const GB_TO_MB = 1024
export class CarbonFootprintAudit extends Audit{
    static get meta(){

        return {
            id:'carbonfootprint',
            title:'',
            failureTitle:'',
            description:'',
            requiredTraces:['transfer']
        }
    }

    static async audit(traces:any, url:string):Promise<SA.Audit.Result>{

        const initialHost = new URL(url).host


        const getGeoLocation = (ip:string) => {
            //2 letter ISO-3166-1 country code https://www.iban.com/country-codes */
            const country = geoip.lookup(ip)?.country
            
            if(country){
                return country
            }

            return 'AVG'
                
            }

        const isGreenServer = async (ip:string)  =>  {
            try{   
            const url = `${GREEN_SERVER_API}/${ip}`
            const response = await (await fetch(url)).json()
            
            return response.green
            }catch(error){
                console.error(error);
                
            }
            }
            
          
        const isGreenServerMem = memoize(isGreenServer, {async:true, maxAge:4000})
        const getGeoLocationMem = memoize(getGeoLocation, {maxAge:4000})

        const getValidRecords = async () => {
                
                const getGreenRecord =  async () => {
                    const pArray = traces.record.map(async record =>{
                        const isGreen = await isGreenServerMem(record.response.remoteAddress.ip)
                        return isGreen
                    })
                    const isGreen = await Promise.all(pArray)
                    return traces.record.map((record,index)=>{

                        return {
                            id:record.request.requestId,
                            host:new URL(record.response.url).host,
                            size:record.CDP.compressedSize,
                            unSize:record.response.uncompressedSize.value,
                            ip:record.response.remoteAddress.ip,
                            isGreen:isGreen[index]
                        }
    
                    })
                    }



                const records = await getGreenRecord()

                return records.map(record=>{

                    if(record.isGreen === false){
                        const location = getGeoLocationMem(record.ip)

                        return {
                            ...record,
                            location
                        }
                    }

                    return record
                })
            }

        const records = await getValidRecords();
        //MAP location to co2eq/location  https://github.com/tmrowco/electricitymap-contrib/blob/master/config/co2eq_parameters.json
        
                   
        /*const ip = response.remoteAddress().ip
        country = geoip.lookup(ip).country
        */
       const totalTransfersize = sum(records.
       map((record:any)=>record.size))

        const totalWattage= records.
        map((record:any)=>{
            let size = record.size/MB_TO_BYTES
            if(record.isGreen){
                size*=variables.coreNetwork[0]
            }else{
                size*=(variables.dataCenter[0]+variables.coreNetwork[0])
            }
            
            return size/GB_TO_MB
        })

        //apply references values
        const metric = sum(totalWattage)*variables.defaultCarbonIntensity[0]*
                        variables.defaultDailyVisitors[0]

        const {median, p10} = DEFAULT.REPORT.scoring.CF

        const score = Audit.computeLogNormalScore({median, p10}, metric)   
        
        console.log(metric,score);
        


        return {
            score:score,
            scoreDisplayMode:'numeric',
            extendedInfo:{
                value:{
                    totalTransfersize,
                    totalWattage:sum(totalWattage),
                    metric
                }
            }


        }
    }
    
}

