import {ClusterOptions, TaskFunctionArguments} from './cluster-options';
import {Collect, PassContext} from '../collect/collect';
import {Audit} from '../audits/audit';
import {CollectTransfer} from '../collect/transfer.collect';


export interface DefaultOptions {
	PUPPETEER_OPTIONS: ClusterOptions;
	CONNECTION_OPTIONS: ConnectionOptions;
}
export interface ConnectionOptions {
	maxNavigationTime: number;
	maxThrottle: number;
}
