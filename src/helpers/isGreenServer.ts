import memoizee = require('memoizee');
import fetch from 'node-fetch';

const GREEN_SERVER_API = 'http://api.thegreenwebfoundation.org/greencheck';

interface APIResponse {
	green: boolean;
	url: string;
	hostedby: string;
	hostedbywebsite: string;
}
const isGreenServer = async (ip: string): Promise<APIResponse | undefined> => {
	try {
		const url = `${GREEN_SERVER_API}/${ip}`;
		const response = await (await fetch(url)).json();

		return response;
	} catch (error) {
		console.error(error);
		return undefined;
	}
};

export const isGreenServerMem = memoizee(isGreenServer, {async: true});
