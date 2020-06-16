import {Audit} from './audit';
export class NoConsoleLogsAudit extends Audit {
	static get meta() {
		return {
			id: 'noconsolelogs',
			title: `Don’t have console logs`,
			failureTitle: 'Have console logs',
			description: `It is important to keep the console log clean of error, warning or info outputs.`,
			category: 'design',
			scoringType: 'server'
		} as SA.Audit.Meta;
	}

	static audit(traces: SA.DataLog.Traces): SA.Audit.Result {

		const dups = new Set();
		const uniqueResources = traces.console.filter(trace => {
			const dup = dups.has(trace.text);
			dups.add(trace.text);
			return !dup;
		});
		const score = Number(uniqueResources.length === 0);
		const meta = Audit.successOrFailureMeta(NoConsoleLogsAudit.meta, score);
		return {
			meta,
			score,
			scoreDisplayMode: 'binary',
			extendedInfo: {
				value: Object.assign({}, ...uniqueResources)
			}
		};
	}
}
