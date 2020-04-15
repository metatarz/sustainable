export interface PassContext {
	page: any;
	data: {
		url: string;
	};
}

export default class Collect {
	beforePass(passContext: PassContext): any {}

	atPass(passContext: PassContext): any {}

	afterPass(passContext: PassContext): any {}
}
