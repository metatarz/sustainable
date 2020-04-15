import {Response, Request} from 'puppeteer';

interface Req {
	requestId: string;
	request: Request;
}

interface Res {
	responseId: string;
	response: Response;
}

interface Audit {
	auditId: string;
	initDate: string;
	finishDate: string;
	screenshotPath: string;
	htmlPath: string; // Page.content =>fs write file or let bodyHTML = await page.evaluate(() => document.querySelector('*').outerHTML););
	totalRequests: number;
	requests: Req[];
	responses: Res[];
	perfMetric: [{[key: string]: string}];
}

interface Results {
	projectId: string;
	audits: Audit;
	lastAudit: string;
}
