import { getLogNormalScore, sum, groupBy } from './../bin/statistics'
import { DEFAULT } from '../config/configuration';

export default class Audit{

   static get meta(){
    return {} as SA.Audit.Meta
   }

   static audit(traces:SA.DataLog.TransferTrace | SA.DataLog.GeneralTrace | SA.DataLog.Traces |
      SA.DataLog.MediaTrace | SA.DataLog.FontsTrace | SA.DataLog.CssTrace | SA.DataLog.JsTrace |
      SA.DataLog.HtmlTrace, url?:string):Promise<SA.Audit.Result | undefined> | SA.Audit.Result | undefined{
    return {} as SA.Audit.Result 
   }
   /**
    * Credits to Google Lighthouse
    * 
   * Computes a score between 0 and 1 based on the measured `value`. Score is determined by
   * considering a log-normal distribution governed by two control points (the 10th
   * percentile value and the median value) and represents the percentage of sites that are
   * greater than `value`.
   * @param {{median: number, p10: number}} controlPoints
   * @param {number} value
   * @return {number}
   */
   static computeLogNormalScore(controlPoints:{median:number, p10:number}, value:number):number{
      const percentile = getLogNormalScore(controlPoints, value);
      
      return Audit.clampTo2Decimals(percentile);
    }

   static clampTo2Decimals = (val:number) => Math.round(val * 100) / 100; 


   /**
    * @description Computes a global calculated as the average sum of category scores.
    *
    * @param audits @type {category:string, score:number, audits: SA.Audits.Result[]}[]
    * @returns {number} A score between [0-100]
    */
   static computeScore(audits:any){
     return  Math.round(sum(audits.map((audit:any)=>audit.score))/2)
   }

   static groupAudits(list:Array<any>){
      const resultsGrouped = groupBy(list, (audit:any)=>audit.meta.category)
   
      const audits = Array.from(resultsGrouped.keys()).map((key:'server'|'design')=>{

         const groupByKey = resultsGrouped.get(key)
         
         const auditScoreRaw = sum(groupByKey.map((result:any)=>result.score))/groupByKey.length
         const auditScore = Math.round(auditScoreRaw*100)
         const catDescription = DEFAULT.CATEGORIES[key].description
         const auditsByPassOrFail = Audit.successOrFailureAudits(groupByKey)

         return {
            category:{name:key, description:catDescription},
            score:auditScore,
            audits:auditsByPassOrFail
         }
      })

      return audits
   }

   static successOrFailureMeta(meta:SA.Audit.Meta, score:number){

      const {title, failureTitle, ...output} = meta
      
      if(Audit.failed(score)){
         return {title:failureTitle, ...output}
      }
      return {title, ...output}

   }

   static failed(score:number){
      if(score===0 || score <= 0.49){
         return true
      }

      return false
   }

   static successOrFailureAudits(audits:SA.Audit.Result[]){

      const out =  audits.reduce((obj, v)=>{
         (Audit.failed(v.score!) ? obj.fail : obj.pass).push(v)
         return obj
      }, {pass:[], fail:[]} as Record<string,SA.Audit.Result[]>)

      return out
   }



}