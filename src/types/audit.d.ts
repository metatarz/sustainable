declare global {
	namespace SA.Audit {
		export interface Meta {
			/** String identifier of the audit */
			id: string;
			/** Short successful audit title */
			title?: string;
			/** Short failed audit title */
			failureTitle?: string;
			/** Audit description, showcasinng importance and useful information */
			description: string;
			/** Audit category: Server or Design */
			category: 'server' | 'design';
			/** Traces names this audit requires */
			scoringType: ScoreWeights;
		}
		export type ScoreDisplayModes = 'numeric' | 'binary' | 'manual';

		export type ScoreDisplayMode = ScoreDisplayModes[keyof ScoreDisplayModes];

		export type ScoreWeights =
			| 'transfer'
			| 'general'
			| 'media'
			| 'html'
			| 'js'
			| 'server'
			| 'fonts';

		export interface Result {
			score: number;
			scoreDisplayMode: ScoreDisplayMode;
			meta: Meta;
			extendedInfo?: {value: ExtendedInfo};
			errorMessage?: string;
		}

		export interface ExtendedInfo {
			[key: string]: any;
		}

		export interface AuditsByCategory {
			category: AuditCategoryAndDescription;
			score: number | null;
			audits: AuditByFailOrPass;
		}

		export interface AuditCategoryAndDescription {
			name: 'server' | 'design';
			description: string;
		}

		export interface AuditByFailOrPass {
			pass: AuditReportFormat[];
			fail: AuditReportFormat[];
		}

		export interface AuditReportFormat {
			title: string;
			score: number;
			scoreDisplayMode: ScoreDisplayMode;
			meta: Meta;
			extendedInfo?: {value: ExtendedInfo};
			errorMessage?: string;
		}
	}
}

export {};
