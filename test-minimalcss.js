const minimalcss = require('minimalcss');

minimalcss
	.minimize({urls: ['https://example.com/']})
	.then(result => {
		console.log('OUTPUT', result.finalCss.length, result.finalCss);
	})
	.catch(error => {
		console.error(`Failed the minimize CSS: ${error}`);
	});
