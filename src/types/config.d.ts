import { ClusterOptions } from "./cluster-options.interface";

declare global {
    module SA{
        module Config{

            export interface DefaultOptions {

                PUPPETEER_OPTIONS:ClusterOptions
                CONNECTION_OPTIONS: {
                    emulatedDevices:EmulatedDevice[],
                    locations:EmulatedLocation[]
                }
                AUDITS:{
                    JS:Array<string>
                    CSS:Array<string>
                    HTML:Array<string>,
                    MEDIA:Array<string>,
                    FONTS:Array<string>,
                    TRANSFER:Array<string>
                    GENERAL:Array<string>,
                    SERVER:Array<string>
                }
                REPORT:{
                    scoring_weight:{[key:string]:number},
                    format?:string,
                    webhook?:string
                }
                

            }

            export interface EmulatedDevice{
                name:string,
                userAgent:string,
                viewport:Viewport,


            }

            interface EmulatedLocation{
                name:string,
                latitude:number,
                longitude:number,
                accuracy:number
            }

            interface Viewport{
                width:number,
                height:number
            }

    }
        }
            }