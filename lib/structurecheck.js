var async = require('async'),
		_ = require('underscore'),
		cheerio = require('cheerio'),
		common = require('./common.js'),
		assert = require('assert');

function structure(file, filename) {
	var $ = cheerio.load(file.contents);
	if (!(file.noh1)) {
		assert($('h1').length > 0, filename + ' has no h1');
	}
	assert($('h1').length < 2, filename + ' has multiple h1s');
};

exports = module.exports = function(config) {
	return function(files, metalsmith, done) {
		async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
			structure(file, filename);
			finished();
		}, function () {
			done();
		});
	}
};
