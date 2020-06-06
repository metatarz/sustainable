import {ClusterOptions} from './cluster-options.interface';

declare global {
	namespace SA {
		namespace Config {
			export interface DefaultOptions {
				PUPPETEER_OPTIONS: ClusterOptions;
				CONNECTION_OPTIONS: {
					maxThrottle:number,
					maxNavigationTime:number,
					emulatedDevices: EmulatedDevice[];
					locations: EmulatedLocation[];
				};
				CATEGORIES:{
					server:{description:string},
					design:{description:string}
				} 
				AUDITS: {
					SERVER: string[];
					DESIGN: string[]
				};
				REPORT: {
					scoringWeight: {[key: string]: number};
					scoring:Scoring
					format?: string;
					webhook?: string;
				};
			}

			export interface Scoring{
				[key:string]:{
				median:number,
				p10:number,
				name:string
				}
			}
			export interface EmulatedDevice {
				name: string;
				userAgent: string;
				viewport: Viewport;
			}

			interface EmulatedLocation {
				name: string;
				latitude: number;
				longitude: number;
				accuracy: number;
			}

			interface Viewport {
				width: number;
				height: number;
			}

			export interface Audit {
				JS: 'JS';
				CSS: 'CSS';
				HTML: 'HTML';
				MEDIA: 'MEDIA';
				FONTS: 'FONTS';
				TRANSFER: 'TRANSFER';
				GENERAL: 'GENERAL';
				SERVER: 'SERVER';
			}
			
		}
	}
}
export{}
