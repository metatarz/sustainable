import {ClusterOptions, TaskFunctionArguments} from './cluster-options';
import {Collect, PassContext} from '../collect/collect';
import {Audit} from '../audits/audit';
import {CollectTransfer} from '../collect/transfer.collect';

declare global {
	namespace SA {
		namespace Config {
			export interface DefaultOptions {
				PUPPETEER_OPTIONS: ClusterOptions;
				CONNECTION_OPTIONS: ConnectionOptions;
				CATEGORIES: {
					server: {description: string};
					design: {description: string};
				};
				AUDITS: CollectorAndAudit;
				REPORT: {
					scoringWeight: {[key: string]: number};
					scoring: Scoring;
					format?: string;
					webhook?: string;
				};
			}

			export interface CollectorAndAudit {
				collectors: CollectorFunction[];
				audits: AuditFunction[];
			}

			type CollectorFunction = (
				passContext: TaskFunctionArguments<any>
			) => Promise<any>;
			type AuditFunction = (
				parsedTraces: any
			) => Promise<SA.Audit.Result | undefined> | SA.Audit.Result | undefined;

			export interface ConnectionOptions {
				maxThrottle: number;
				maxNavigationTime: number;
				emulatedDevices: EmulatedDevice[];
				locations: EmulatedLocation[];
			}

			export interface Scoring {
				[key: string]: {
					median: number;
					p10: number;
					name: string;
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
		}
	}
}
export {};
