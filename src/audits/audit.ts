import { getLogNormalScore, sum } from './../bin/statistics'
import { DEFAULT } from '../config/configuration';

export default class Audit{

   static get meta(){
    return {} as SA.Audit.Meta
   }

   static audit(traces:SA.DataLog.TransferTrace | SA.DataLog.GeneralTrace | 
      SA.DataLog.MediaTrace | SA.DataLog.FontsTrace | SA.DataLog.CssTrace | SA.DataLog.JsTrace |
      SA.DataLog.HtmlTrace, url?:string):Promise<SA.Audit.Result> | SA.Audit.Result{
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
    * @description Computes a global score regarding audit score weights.
    *
    * @param audits @type {SA.Audit.Result[]} Array of Audits
    * @returns {number} A score between [0-100]
    */
   static computeScore(audits:SA.Audit.Result[]){

try{
      const totalScoreByAuditType = audits.map(audit=>{
         
         const weight = DEFAULT.REPORT.scoringWeight[audit.meta.scoringType]
         const partialScore = audit.score!*weight
         return partialScore
      })


      const rawScore = sum(totalScoreByAuditType)/(totalScoreByAuditType.length+1)
      const score = Math.round(rawScore*100)
      return score

}catch(error){
   console.log(error);
   
}
   }


}