import {ClusterOptions} from './cluster-options.interface';

declare global {
	namespace SA {
		namespace Config {
			export interface DefaultOptions {
				PUPPETEER_OPTIONS: ClusterOptions;
				CONNECTION_OPTIONS: {
					emulatedDevices: EmulatedDevice[];
					locations: EmulatedLocation[];
				};
				AUDITS: {
					JS: string[];
					CSS: string[];
					HTML: string[];
					MEDIA: string[];
					FONTS: string[];
					TRANSFER: string[];
					GENERAL: string[];
					SERVER: string[];
				};
				REPORT: {
					scoringWeight: {[key: string]: number};
					format?: string;
					webhook?: string;
				};
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
