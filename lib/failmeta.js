var async = require('async'),
		cheerio = require('cheerio'),
		common = require('./common.js');

module.exports = function(config) {
	return function(files, metalsmith, done) {
		async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
			var $ = cheerio.load(file.contents);
			if (!$('title')) {
				done(new Error('must provide a title for ' + filename));
			} else if (!$('description')) {
				done(new Error('must provide a description for ' + filename));
			}
			finished();
		}, function () {
			done();
		});
	}
};

