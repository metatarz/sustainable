import { getLogNormalScore, sum } from './../bin/statistics'
import { DEFAULT } from '../config/configuration';

export default class Audit{

   static get meta(){
    return {} as SA.Audit.Meta
   }

   static audit(traces:Array<string>, url?:string):Promise<SA.Audit.Result> | SA.Audit.Result{
    return {} as SA.Audit.Result
   }
   /**
    * Credits to Google Lighthouse Audits
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

   static computeScore(audits:any){
      const transferScoring = DEFAULT.REPORT.scoringWeight.transfer
      const score = sum(audits.map(el=>el.value.score))
      return Math.round((score/audits.length)*transferScoring*100)
   }  


}